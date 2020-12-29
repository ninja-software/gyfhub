package api

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	gyfhub "gyfhub/server"
	"gyfhub/server/crypto"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/mailgun/mailgun-go/v3"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"golang.org/x/crypto/bcrypt"
)

// AuthController contains handlers involving authentication
type AuthController struct {
	conn           *sqlx.DB
	cookieDefaults CookieSettings
	auther         *gyfhub.Auther
	mailer         *mailgun.MailgunImpl
	bp             gyfhub.BlacklistProvider
	mailHost       *MailHost
}

// MailHost contain the detail of the host
type MailHost struct {
	Host   string
	Sender string
}

// AuthRouter returns a router for use in authentication
func AuthRouter(
	conn *sqlx.DB,
	auther *gyfhub.Auther,
	jwtSecret string,
	mailer *mailgun.MailgunImpl,
	mailHost *MailHost,
	bp gyfhub.BlacklistProvider,
) chi.Router {
	cookieDefaults := CookieSettings{
		SameSite: http.SameSiteDefaultMode,
		HTTPOnly: true,
		Secure:   false, // TODO: set to true when https available. currently not enabled for dev
		Path:     "/",
	}

	c := &AuthController{
		conn:           conn,
		cookieDefaults: cookieDefaults,
		auther:         auther,
		mailer:         mailer,
		bp:             bp,
		mailHost:       mailHost,
	}

	r := chi.NewRouter()
	r.Post("/login", WithError(c.login))
	r.Post("/register", WithError(c.register))
	r.Post("/logout", WithError(c.logout))
	r.Post("/verify_account", WithError(c.verifyAccount))
	r.Post("/forgot_password", WithError(c.forgotPassword))
	r.Post("/reset_password", WithError(c.resetPassword))

	// required user logged in
	r.Post("/change_password", WithError(WithMember(conn, jwtSecret, c.changePassword)))
	return r
}

// LoginRequest structs for the HTTP request/response cycle
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterRequest structs for the HTTP request/response cycle
type RegisterRequest struct {
	Firstname    string  `json:"firstName"`
	Email        string  `json:"email"`
	Password     string  `json:"password"`
	BusinessName *string `json:"businessName"`
}

// LoginResponse structs for the HTTP request/response cycle
type LoginResponse struct {
	Verified bool `json:"verified"`
	Success  bool `json:"success"`
}

// login logs a user in
func (c *AuthController) login(w http.ResponseWriter, r *http.Request) (int, error) {
	req := &LoginRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// email must be lower case
	email := strings.ToLower(req.Email)

	err = gyfhub.ValidatePassword(c.conn, email, req.Password)
	if err != nil {
		return http.StatusUnauthorized, terror.New(err, "invalid email or password")
	}

	// load user details
	user, err := db.Users(db.UserWhere.Email.EQ(email)).One(c.conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to load user")
	}

	// save user detail in encrypted cookie and make it persist
	expiration := time.Now().Add(time.Duration(c.auther.TokenExpirationDays) * time.Hour * 24)
	jwt, err := c.auther.GenerateJWT(email, user.ID, r.UserAgent())
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "cookie fail")
	}

	// push cookie to browser
	cookie := c.generateCookie(r.Context(), jwt, expiration)
	http.SetCookie(w, &cookie)

	lr := &LoginResponse{
		Verified: user.Verified,
		Success:  true,
	}
	httpWriteJSON(w, lr)
	return http.StatusOK, nil

}

// logout
func (c *AuthController) logout(w http.ResponseWriter, r *http.Request) (int, error) {
	// clear and expire cookie and push to browser
	cookie := c.generateCookie(r.Context(), "", time.Now().AddDate(-1, 0, 0))
	http.SetCookie(w, &cookie)

	resp := &BasicResponse{
		Success: true,
	}
	httpWriteJSON(w, resp)
	return http.StatusOK, nil
}

func (c *AuthController) register(w http.ResponseWriter, r *http.Request) (int, error) {
	req := &RegisterRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, err
	}

	// get email
	req.Email = strings.ToLower(req.Email)

	if req.Email == "" || req.Firstname == "" {
		return http.StatusBadRequest, terror.New(fmt.Errorf("User Register Failed"), "Missing Values")
	}

	// check if email already exists
	u, err := db.Users(db.UserWhere.Email.EQ(req.Email)).One(c.conn)
	if err != nil && err != sql.ErrNoRows {
		return http.StatusBadRequest, terror.New(err, "User already exists with that email address.")
	}

	if u != nil {
		return http.StatusBadRequest, terror.New(fmt.Errorf("Email already in use"), "User already exists with that email address.")
	}

	// get password
	if len(req.Password) < 8 {
		return http.StatusBadRequest, terror.New(fmt.Errorf("User Register Failed"), "Password must have at least 8 characters")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "An unknown error has occurred")
	}
	hashedB64 := base64.StdEncoding.EncodeToString(hashed)

	// start transaction
	tx, err := c.conn.Beginx()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Failed to register user")
	}
	defer tx.Rollback()

	var b *db.Business
	if !helpers.IsEmptyStringPtr(req.BusinessName) {
		b = &db.Business{
			Name: *req.BusinessName,
		}
		err := b.Insert(tx, boil.Infer())
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "Failed to insert business")
		}
	}

	// add user to database
	user := &db.User{
		Email:        req.Email,
		FirstName:    req.Firstname,
		PasswordHash: hashedB64,
		Type:         string(Creative),
	}

	if !helpers.IsEmptyStringPtr(req.BusinessName) {
		user.Type = string(Business)
	}

	err = user.Insert(tx, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Failed to register user")
	}

	// insert business
	if u.Type == string(Business) {
		b := &db.Business{
			Name:    *req.BusinessName,
			OwnerID: u.ID,
		}
		err = b.Insert(tx, boil.Infer())
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "failed to insert business")
		}
	}

	// commit to db
	err = tx.Commit()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Failed to register user")
	}

	response, err := json.Marshal(user)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "An unknown error has occurred")
	}

	// save user detail in encrypted cookie and make it persist
	expiration := time.Now().Add(time.Duration(c.auther.TokenExpirationDays) * time.Hour * 24)
	jwt, err := c.auther.GenerateJWT(req.Email, user.ID, r.UserAgent())
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "cookie fail")
	}

	// push cookie to browser
	cookie := c.generateCookie(r.Context(), jwt, expiration)
	http.SetCookie(w, &cookie)

	w.Write(response)
	return http.StatusOK, nil
}

// verifyAccount verifies an account and logs the user in
func (c *AuthController) verifyAccount(w http.ResponseWriter, r *http.Request) (int, error) {
	type Req struct {
		Token string `json:"token"`
	}

	req := &Req{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "bad json")
	}
	defer r.Body.Close()

	// user, err := c.userStorer.GetByVerifyToken(req.Token)
	user, err := db.Users(db.UserWhere.VerifyToken.EQ(req.Token)).One(c.conn)
	if err != nil && err != sql.ErrNoRows {
		return http.StatusBadRequest, terror.New(err, "invalid token")
	}

	if user.VerifyTokenExpires.Before(time.Now()) {
		return http.StatusBadRequest, terror.New(err, "invalid token")
	}

	if user == nil {
		err := terror.ErrDataBlank
		return http.StatusBadRequest, terror.New(err, "no user data")
	}

	if user.Verified {
		err := fmt.Errorf("error 294ec591-216f-4b2e-b15e-8086c1c43c7b")
		return http.StatusBadRequest, terror.New(err, "user already verified")
	}

	user.Verified = true
	_, err = user.Update(c.conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to update user")
	}

	// Authenticate the user so they can continue to the portal and set their password
	jwt, err := c.auther.GenerateJWT(user.Email, user.ID, r.UserAgent())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to create session")
	}

	// push cookie to browser
	expiration := time.Now().Add(time.Duration(c.auther.TokenExpirationDays) * time.Hour * 24)
	cookie := c.generateCookie(r.Context(), jwt, expiration)
	http.SetCookie(w, &cookie)

	w.WriteHeader(http.StatusOK)

	resp := &BasicResponse{
		Success: true,
	}
	httpWriteJSON(w, resp)
	return http.StatusOK, nil
}

// ForgotPasswordRequest structs for the HTTP request/response cycle
type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

// forgotPassword
func (c *AuthController) forgotPassword(w http.ResponseWriter, r *http.Request) (int, error) {
	req := &ForgotPasswordRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// email must be lower case
	email := strings.ToLower(req.Email)

	user, err := db.Users(db.UserWhere.Email.EQ(email)).One(c.conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(terror.ErrAuthNoEmail, "fail to query user")
	}

	// Generate new verify token
	user.ResetToken = uuid.Must(uuid.NewV4()).String()
	user.ResetTokenExpires = time.Now().AddDate(0, 0, c.auther.ResetTokenExpiryDays)
	_, err = user.Update(c.conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to reset token")
	}

	// Create email
	subject := "gyfhub - Forgot Password"

	name := "UserDetail"
	if user.FirstName != "" {
		name = user.FirstName
	}
	if user.LastName != "" {
		name += " " + user.LastName
	}

	message := c.mailer.NewMessage(c.mailHost.Sender, subject, "", user.Email)
	message.SetTemplate("portal_forgot_password")
	message.AddVariable("name", name)
	message.AddVariable("magic_link", fmt.Sprintf("%s/reset/%s", c.mailHost.Host, user.ResetToken))

	// Send Email
	emailCtx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	_, _, err = c.mailer.Send(emailCtx, message)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to send email")
	}

	w.WriteHeader(http.StatusOK)

	resp := &BasicResponse{
		Success: true,
	}
	httpWriteJSON(w, resp)

	return http.StatusOK, nil

}

// ResetPasswordRequest structs for the HTTP request/response cycle
type ResetPasswordRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// resetPassword
func (c *AuthController) resetPassword(w http.ResponseWriter, r *http.Request) (int, error) {
	req := &ResetPasswordRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	token := req.Token
	newPassword := req.Password

	_, err = gyfhub.IsValidPassword(newPassword)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid password")
	}

	user, err := db.Users(db.UserWhere.ResetToken.EQ(token)).One(c.conn)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid token")
	}
	if user.ResetTokenExpires.Before(time.Now()) {
		return http.StatusBadRequest, terror.New(err, "token expired")
	}

	hashed := crypto.HashPassword(newPassword)
	user.PasswordHash = hashed
	user.ResetToken = uuid.Must(uuid.NewV4()).String()
	user.ResetTokenExpires = time.Now()

	_, err = user.Update(c.conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to reset password")
	}

	// Blacklist all old tokens
	err = c.bp.BlacklistAll(user.ID)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "fail to reset password")
	}

	// validate password

	w.WriteHeader(http.StatusOK)

	resp := &BasicResponse{
		Success: true,
	}
	httpWriteJSON(w, resp)

	return http.StatusOK, nil
}

// ChangePasswordRequest structs for the HTTP request/response cycle
type ChangePasswordRequest struct {
	ID          string `json:"id"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// changePassword
func (c *AuthController) changePassword(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &ChangePasswordRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	id := req.ID
	oldPassword := req.OldPassword
	newPassword := req.NewPassword

	if u.ID != id {
		return http.StatusUnauthorized, terror.New(fmt.Errorf("Permission deny"), "Unauthorised action")
	}

	_, err = gyfhub.IsValidPassword(newPassword)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid password")
	}

	targetUser, err := db.FindUser(c.conn, id)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Change Password")
	}

	// When user first verifies email, they are sent to set their password for the first time, does not need old password
	// After this, old password should be required to set new password.
	if targetUser.RequireOldPassword {
		err = crypto.ComparePassword(targetUser.PasswordHash, oldPassword)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "fail to validate password")
		}
	}

	// Set value to true, as initial password set without old password will only be allowed once.
	if !targetUser.RequireOldPassword {
		targetUser.RequireOldPassword = true
	}

	hashed := crypto.HashPassword(newPassword)

	targetUser.PasswordHash = hashed

	_, err = targetUser.Update(c.conn, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Change Password")
	}

	// Blacklist all old tokens
	err = c.bp.BlacklistAll(targetUser.ID)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "Change Password")
	}

	w.WriteHeader(http.StatusOK)

	resp := &BasicResponse{
		Success: true,
	}
	httpWriteJSON(w, resp)

	return http.StatusOK, nil
}
