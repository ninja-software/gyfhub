package api

import (
	"encoding/json"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"net/http"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-chi/chi"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
)

type GifyController struct {
	Conn   *sqlx.DB
	Auther *gyfhub.Auther
	GifAPI string
}

func GifyRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	gifAPI string,
) chi.Router {
	c := &GifyController{
		conn,
		auther,
		gifAPI,
	}

	r := chi.NewRouter()
	r.Post("/many", WithError(WithMember(conn, jwtSecret, c.GifyMany)))
	return r
}

type GifManyRequest struct {
	Search string `json:"search"`
}

type GifObject struct {
	ID        string              `json:"id"`
	Slug      string              `json:"slug"`
	Url       string              `json:"url"`
	Embed_url string              `json:"embed_url"`
	Source    string              `json:"source"`
	Rating    string              `json:"rating"`
	Title     string              `json:"title"`
	Images    map[string]GifImage `json:"images"`
}

type GifImage struct {
	Url    string `json:"url"`
	Height string `json:"height"`
	Width  string `json:"width"`
}

type GifData struct {
	Data []*GifObject `json:"data"`
}

func (c GifyController) GifyMany(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	req := &GifManyRequest{}
	err := json.NewDecoder(r.Body).Decode(req)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "")
	}

	spew.Dump(req.Search)

	defer r.Body.Close()

	searchStr := strings.ReplaceAll(req.Search, " ", "+")

	// fetch gifs
	resp, err := http.Get("https://api.giphy.com/v1/gifs/search?api_key=" + c.GifAPI + "=" + searchStr + "&limit=60&offset=0&rating=R&lang=en")
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	defer resp.Body.Close()

	gifs := &GifData{}
	err = json.NewDecoder(resp.Body).Decode(&gifs)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	return helpers.EncodeJSON(w, gifs.Data)
}
