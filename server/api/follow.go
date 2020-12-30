package api

import (
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
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
	r.Post("/friendsList", WithError(WithMember(conn, jwtSecret, c.GetFollowers)))
	r.Post("/sendRequest", WithError(WithMember(conn, jwtSecret, c.SendRequest)))
	r.Post("/acceptRequest", WithError(WithMember(conn, jwtSecret, c.UpdateRequest)))

	return r
}

type FriendsListRequest struct {
	Search string `json:"search"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
	Filter string `json:"filter"`
}

type RequestInput struct {
}

// GetFollowers returns amount of follows
func (c *FollowController) GetFollowers(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
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
func (c *FollowController) SendRequest(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {

	panic("")
}

// AcceptFriendRequest accepts the invitation
func (c *FollowController) UpdateRequest(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	panic("")
}
