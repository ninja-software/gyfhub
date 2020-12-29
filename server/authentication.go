package gyfhub

import (
	"context"
	"gyfhub/server/crypto"
	"gyfhub/server/db"
	"fmt"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/volatiletech/sqlboiler/v4/boil"

	"github.com/gofrs/uuid"
	"github.com/ninja-software/terror"

	"github.com/go-chi/jwtauth"
)

// Auther to handle JWT authentication
type Auther struct {
	Conn                 *sqlx.DB
	TokenExpirationDays  int
	ResetTokenExpiryDays int `desc:"How many days before the reset token expires" default:"1"`
	TokenAuth            *jwtauth.JWTAuth
	Blacklister          BlacklistProvider
}

// NewAuther for JWT and blacklisting
func NewAuther(conn *sqlx.DB, jwtsecret string, blacklister BlacklistProvider, tokenExpirationDays int, resetTokenExpiryDays int) *Auther {
	result := &Auther{
		TokenAuth:            jwtauth.New("HS256", []byte(jwtsecret), []byte(jwtsecret)),
		Blacklister:          blacklister,
		TokenExpirationDays:  tokenExpirationDays,
		ResetTokenExpiryDays: resetTokenExpiryDays,
		Conn:                 conn,
	}
	return result
}

// ClaimsFromContext a map of all claims in JWT
func ClaimsFromContext(ctx context.Context) (map[string]string, error) {
	_, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return nil, terror.New(err, "get client from context")
	}
	result := map[string]string{}
	for k, v := range claims {
		val, ok := v.(string)
		if !ok {
			continue
		}
		result[k] = val
	}
	return result, nil
}

// ClaimKey is a type used to set values in the JWT
type ClaimKey string

// ClaimUserName JWT key value
const ClaimUserName ClaimKey = "username"

// ClaimUserID JWT key value
const ClaimUserID ClaimKey = "uid"

// ClaimOrgID JWT key value
const ClaimOrgID ClaimKey = "oid"

// ClaimRoles JWT key value
const ClaimRoles ClaimKey = "roles"

// ClaimTokenID JWT key value
const ClaimTokenID ClaimKey = "tokenId"

// ClaimExistsInContext returns a specific claim value from the JWT
func ClaimExistsInContext(ctx context.Context, key ClaimKey) bool {
	_, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return false
	}
	_, ok := claims.Get(string(key))
	if !ok {
		return false
	}
	return true
}

// ClaimValueFromContext returns a specific claim value from the JWT
func ClaimValueFromContext(ctx context.Context, key ClaimKey) (string, error) {
	_, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return "", terror.New(terror.ErrBadContext, "Bad context")
	}
	valI, ok := claims.Get(string(key))
	if !ok {
		return "", terror.New(terror.ErrBadClaims, "Bad claims")
	}
	val, ok := valI.(string)
	if !ok {
		return "", terror.New(terror.ErrTypeCast, "type cast")
	}
	return val, nil
}

// UserFromContext grabs the user from the context if a JWT is inside
// This is a heavy func, don't use it too often, and if you do, bend your knees
func (a *Auther) UserFromContext(ctx context.Context) (*db.User, error) {
	uid, err := a.UserIDFromContext(ctx)
	if err != nil {
		return nil, terror.New(err, "get user")
	}
	u, err := db.FindUser(a.Conn, uid.String())
	if err != nil {
		return nil, terror.New(err, "get user")
	}
	return u, nil
}

// UserIDFromContext grabs the user id from the context if a JWT is inside
func (a *Auther) UserIDFromContext(ctx context.Context) (uuid.UUID, error) {
	jwtToken, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return uuid.Nil, terror.New(terror.ErrBadContext, "bad claims")
	}

	if jwtauth.IsExpired(jwtToken) {
		return uuid.Nil, terror.New(fmt.Errorf("token has expired"), "expired token")
	}

	userIDI, ok := claims.Get(string(ClaimUserID))
	if !ok {
		return uuid.Nil, terror.New(terror.ErrBadClaims, "bad claims")
	}

	tokenID, ok := claims.Get("tokenId")
	if !ok {
		return uuid.Nil, terror.New(terror.ErrBadClaims, "bad claims")
	}

	blacklisted := a.Blacklister.OnList(tokenID.(string))
	if blacklisted {
		return uuid.Nil, terror.New(terror.ErrBlacklisted, "black listed")
	}

	userIDStr, ok := userIDI.(string)
	if !ok {
		return uuid.Nil, terror.New(terror.ErrTypeCast, "type cast")
	}
	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		return uuid.Nil, terror.New(terror.ErrParse, "parse error")
	}

	return userID, nil
}

// GenerateJWT returns the token for client side persistence
func (a *Auther) GenerateJWT(username string, userID string, userAgent string) (string, error) {
	// Record token in issued token records

	//TODO: device currently being set by request.UserAgent() ... might need to parse to get a better device name
	newToken := &db.IssuedToken{
		UserID:       userID,
		Device:       userAgent,
		TokenExpires: time.Now().Add(time.Hour * time.Duration(24) * time.Duration(a.TokenExpirationDays)),
	}
	err := newToken.Insert(a.Conn, boil.Infer())
	if err != nil {
		return "", terror.New(err, "get token")
	}
	_, tokenString, err := a.TokenAuth.Encode(jwtauth.Claims{
		string(ClaimUserName): username,
		string(ClaimUserID):   userID,
		string(ClaimTokenID):  newToken.ID,
	})
	if err != nil {
		return "", terror.New(err, "encode token")
	}
	return tokenString, nil
}

// VerifyMiddleware for authentication adds JWT to context down the HTTP chain
func (a *Auther) VerifyMiddleware() func(http.Handler) http.Handler {
	return jwtauth.Verifier(a.TokenAuth)
}

// ValidatePassword will check the login details
func ValidatePassword(conn *sqlx.DB, email string, password string) error {
	user, err := db.Users(db.UserWhere.Email.EQ(email)).One(conn)
	if err != nil {
		return terror.New(err, "fail to get email")
	}

	err = crypto.ComparePassword(user.PasswordHash, password)
	if err != nil {
		return terror.New(err, "fail to validate password")
	}

	return nil
}
