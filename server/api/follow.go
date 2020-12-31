package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
)

// UserController holds connection data for handlers
type FollowController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

func FollowRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
) chi.Router {
	c := &FollowController{
		conn,
		auther,
		blobURL,
	}

	r := chi.NewRouter()
	r.Get("/followers", WithError(WithMember(conn, jwtSecret, c.ListFollowers)))
	r.Get("/following", WithError(WithMember(conn, jwtSecret, c.ListFollowing)))
	r.Post("/follow", WithError(WithMember(conn, jwtSecret, c.Follow)))
	r.Post("/unfollow", WithError(WithMember(conn, jwtSecret, c.UnFollow)))

	return r
}

type FollowerListRequest struct {
	Search string `json:"search"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
	Filter string `json:"filter"`
}

type FollowRequest struct {
	FollowedID string `json:"followedID"`
}

// ListFollowers returns amount of follows of the users
func (c *FollowController) ListFollowers(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	queries := []qm.QueryMod{
		qm.Load(
			db.UserRels.FollowerUserUsers,
		),
	}
	followers, err := u.FollowerUserUsers(queries...).All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "followed query")
	}

	return helpers.EncodeJSON(w, followers)

}

// ListFollowing returns amount of followed users
func (c *FollowController) ListFollowing(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	queries := []qm.QueryMod{
		qm.Load(
			db.UserRels.FollowedUserUsers,
		),
	}
	following, err := u.FollowedUserUsers(queries...).All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "followed query")
	}

	return helpers.EncodeJSON(w, following)

}

// Follow
func (c *FollowController) Follow(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &FollowRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// Check if already followed
	f, err := u.FollowedUserUsers(
		db.UserWhere.ID.EQ(req.FollowedID),
	).One(c.Conn)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return http.StatusBadRequest, terror.New(err, "query follower")
	}

	if f != nil {
		return http.StatusBadRequest, terror.New(fmt.Errorf("Already followed"), "")
	}

	f, err = db.FindUser(c.Conn, req.FollowedID)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "cannot find user")
	}

	err = u.AddFollowedUserUsers(c.Conn, false, f)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "follow")
	}

	return helpers.EncodeJSON(w, true)
}

// AcceptFriendRequest accepts the invitation
func (c *FollowController) UnFollow(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &FollowRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	// Check if already followed
	f, err := u.FollowedUserUsers(
		db.UserWhere.ID.EQ(req.FollowedID),
	).One(c.Conn)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return http.StatusBadRequest, terror.New(err, "query follower")
	}

	if f != nil {
		err = u.RemoveFollowedUserUsers(c.Conn, f)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "unfollow")
		}
	}

	return helpers.EncodeJSON(w, true)
}
