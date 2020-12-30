package api

import (
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"
	"sort"

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
	r.Get("/globalStats", WithError(WithMember(conn, jwtSecret, c.GetGlobalStats)))

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

	gifsSent, err := u.SenderMessages().Count(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get gif count")
	}

	userMsgs, err := u.SenderMessages().All(c.Conn)
	msgsContent := []string{}
	for _, m := range userMsgs {
		msgsContent = append(msgsContent, m.Content)
	}

	stats := &UserStats{
		GifsSent: int(gifsSent),
		MostUsed: getMostUsed(msgsContent),
	}

	return helpers.EncodeJSON(w, stats)
}

type MessageCount struct {
	url   string
	count int
}

func getMostUsed(urls []string) string {
	// count same words in s
	m := make(map[string]int)
	for _, word := range urls {
		if _, ok := m[word]; ok {
			m[word]++
		} else {
			m[word] = 1
		}
	}

	// create and fill slice of word-count pairs for sorting by count
	msgCount := make([]MessageCount, 0, len(m))
	for key, val := range m {
		msgCount = append(msgCount, MessageCount{url: key, count: val})
	}

	// sort wordCount slice by decreasing count number
	sort.Slice(msgCount, func(i, j int) bool {
		return msgCount[i].count > msgCount[j].count
	})

	if len(msgCount) <= 0 {
		return ""
	}
	return msgCount[0].url

}

// GetGlobalStats returns GlobalStats
func (c *StatsController) GetGlobalStats(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {

	gifsSent, err := db.Messages().Count(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get gif count")
	}

	msgs, err := db.Messages().All(c.Conn)
	msgsContent := []string{}
	for _, m := range msgs {
		msgsContent = append(msgsContent, m.Content)
	}

	usersCount, err := db.Users().Count(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get users count")
	}

	stats := &GlobalStats{
		GifsSent:   int(gifsSent),
		MostUsed:   getMostUsed(msgsContent),
		UsersCount: int(usersCount),
	}

	return helpers.EncodeJSON(w, stats)
}
