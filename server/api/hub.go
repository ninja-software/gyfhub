package api

import (
	"encoding/json"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
)

// HubController holds connection data for handlers
type HubController struct {
	Conn    *sqlx.DB
	Auther  *gyfhub.Auther
	BlobURL string
}

// HubRouter router
func HubRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
) chi.Router {
	c := &HubController{
		conn,
		auther,
		blobURL,
	}

	r := chi.NewRouter()
	r.Post("/create", WithError(WithMember(conn, jwtSecret, c.CreateHub)))
	r.Post("/all", WithError(WithMember(conn, jwtSecret, c.All)))

	return r
}

// Hub response
type Hub struct {
	*db.Hub
	AvatarURL string `json:"avatarURL"`
}

// NewHub return hub details
func NewHub(h *db.Hub, blobBaseURL string) *Hub {
	hub := &Hub{
		Hub: h,
	}
	if h.AvatarID.Valid {
		hub.AvatarURL = blobBaseURL + h.AvatarID.String
	}
	return hub
}

// HubInput input
type HubInput struct {
	ID        uuid.UUID `json:"id"`
	AvatarID  *string   `json:"avatarID"`
	Name      string    `json:"name"`
	IsPrivate bool      `json:"isPrivate"`
}

// CreateHub creates a single hub
func (c *HubController) CreateHub(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	input := &HubInput{}
	err := json.NewDecoder(r.Body).Decode(input)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "invalid user input")
	}
	defer r.Body.Close()

	tx, err := c.Conn.Beginx()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "create hub")
	}

	defer tx.Rollback()

	hub := &db.Hub{
		Name:      input.Name,
		IsPrivate: input.IsPrivate,
	}
	err = hub.Insert(c.Conn, boil.Infer())

	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "create hub")
	}

	err = tx.Commit()
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "update user")
	}

	return helpers.EncodeJSON(w, true)
}

// All returns all hubs in db
func (c *HubController) All(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {

	hubs, err := db.Hubs().All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "get hubs")
	}

	return helpers.EncodeJSON(w, hubs)
}
