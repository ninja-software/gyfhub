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
	r.Post("/friendsList", WithError(WithMember(conn, jwtSecret, c.ListFollowers)))
	r.Post("/follow", WithError(WithMember(conn, jwtSecret, c.Follow)))
	r.Post("/unfollow", WithError(WithMember(conn, jwtSecret, c.UnFollow)))

	return r
}

type FriendsListRequest struct {
	Search string `json:"search"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
	Filter string `json:"filter"`
}

type FollowRequest struct {
	FollowedID string `json:"followedID"`
}

// GetFollowers returns amount of follows
func (c *FollowController) ListFollowers(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	// req := &FriendsListRequest{}
	// err := json.NewDecoder(r.Body).Decode(req)
	// if err != nil {
	// 	return http.StatusBadRequest, terror.New(err, "invalid input")
	// }
	// defer r.Body.Close()

	// search := req.Search
	// limit := req.Limit
	// offset := req.Offset

	// queries := []qm.QueryMod{
	// 	qm.Load(
	// 		db.ConnectionRels.Users,
	// 	),
	// }
	panic("")
}

// u.Connections().All(c.Conn)

// SendFriendRequest sends an invitation
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

	err = u.SetFollowedUserUsers(c.Conn, false, f)
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
		err = u.SetFollowedUserUsers(c.Conn, false, nil)
		if err != nil {
			return http.StatusInternalServerError, terror.New(err, "unfollow")
		}
		return http.StatusBadRequest, terror.New(fmt.Errorf("Already followed"), "")
	}

	return helpers.EncodeJSON(w, true)
}
