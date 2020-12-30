package api

import (
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
)

// StatsController holds connection data for handlers
type StatsController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

// StatsRouter router
func StatsRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
) chi.Router {
	c := &StatsController{
		conn,
		auther,
		blobURL,
	}

	r := chi.NewRouter()
	r.Get("/userStats", WithError(WithMember(conn, jwtSecret, c.GetUserStats)))
	r.Post("/globalStats", WithError(WithMember(conn, jwtSecret, c.GetGlobalStats)))

	return r
}

// UserStats response
type UserStats struct {
	GifsSent int    `json:"gifsSent"`
	MostUsed string `json:"mostUsed"`
}

// GlobalStats response
type GlobalStats struct {
	GifsSent   int    `json:"gifsSent"`
	MostUsed   string `json:"mostUsed"`
	UsersCount int    `json:"usersCount"`
}

// GetUserStats returns UserStats
func (c *StatsController) GetUserStats(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {

	hubs, err := db.Hubs().All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get hubs")
	}

	return helpers.EncodeJSON(w, hubs)
}

// GetGlobalStats returns GlobalStats
func (c *StatsController) GetGlobalStats(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {

	hubs, err := db.Hubs().All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get hubs")
	}

	return helpers.EncodeJSON(w, hubs)
}
