package api

import (
	"encoding/json"
	"fmt"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/null/v8"
	"github.com/volatiletech/sqlboiler/v4/boil"
)

// UserController holds connection data for handlers
type UserController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

func UserRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
) chi.Router {
	c := &UserController{
		conn,
		auther,
		blobURL,
	}

	r := chi.NewRouter()
	r.Get("/me", WithError(WithMember(conn, jwtSecret, c.UserMe)))
	r.Post("/updateUser", WithError(WithMember(conn, jwtSecret, c.UpdateUser)))

	return r
}

// response
type UserDetail struct {
	*db.User
	AvatarURL          string `json:"avatarURL"`
	VerifyToken        omit   `json:"verifyToken,omitempty"`
	VerifyTokenExpires omit   `json:"verifyTokenExpires,omitempty"`
	ResetToken         omit   `json:"resetToken,omitempty"`
	ResetTokenExpires  omit   `json:"resetTokenExpires,omitempty"`
	PasswordHash       omit   `json:"passwordHash,omitempty"`
	Keywords           omit   `json:"keywords,omitempty"`
}

// NewUser return user details
func NewUser(u *db.User, blobBaseURL string) *UserDetail {
	user := &UserDetail{
		User: u,
	}
	if u.AvatarID.Valid {
		user.AvatarURL = blobBaseURL + u.AvatarID.String
	}
	return user
}

type UserType string

const (
	Creative UserType = "Creative"
	Business UserType = "Business"
)

func (e UserType) IsValid() bool {
	switch e {
	case Creative, Business:
		return true
	}
	return false
}

type UserInput struct {
	ID        uuid.UUID `json:"id"`
	AvatarID  *string   `json:"avatarID"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	City      *string   `json:"city"`
}

// UserMe return current data
func (c *UserController) UserMe(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	resp, err := c.prepareUserDetail(u.ID)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get me")
	}

	return helpers.EncodeJSON(w, resp)
}

func (c *UserController) prepareUserDetail(id string) (*UserDetail, error) {
	// load user with its reference detail
	u, err := db.Users(
		db.UserWhere.ID.EQ(id),
	).One(c.Conn)
	if err != nil {
		return nil, terror.New(err, "fetch user from db")
	}

	return NewUser(u, c.BlobURL), nil
}

// UpdateUser detail
func (c *UserController) UpdateUser(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	input := &UserInput{}
	err := json.NewDecoder(r.Body).Decode(input)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	tx, err := c.Conn.Beginx()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "update user")
	}

	defer tx.Rollback()

	// check email
	if u.Email != input.Email {
		exists, err := db.Users(
			db.UserWhere.Email.EQ(input.Email),
		).Exists(tx)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "update user")
		}

		if exists {
			return http.StatusInternalServerError, terror.New(fmt.Errorf("email is already exist"), "update user")
		}
	}

	// updates the data based on inputs
	u.FirstName = input.FirstName
	u.LastName = input.LastName
	u.Email = input.Email
	u.City = null.StringFromPtr(input.City)
	if !helpers.IsEmptyStringPtr(input.AvatarID) {
		u.AvatarID = null.StringFromPtr(input.AvatarID)
	}
	_, err = u.Update(tx, boil.Infer())
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "update user")
	}

	err = tx.Commit()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "update user")
	}

	return helpers.EncodeJSON(w, true)
}
