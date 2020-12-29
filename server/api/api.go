package api

import (
	"context"
	"encoding/json"
	"fmt"
	gyfhub "gyfhub/server"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/jmoiron/sqlx"
	"github.com/mailgun/mailgun-go/v3"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

// NewAPIController creates a new root handler for the server
func NewAPIController(
	conn *sqlx.DB,
	log *zap.SugaredLogger,
	bp gyfhub.BlacklistProvider,
	jwtSecret string,
	auther *gyfhub.Auther,
	mailer *mailgun.MailgunImpl,
	mailHost *MailHost,
	webRoot string,
) http.Handler {
	// url for querying blob attachment
	blobURL := "/api/files/"

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(auther.VerifyMiddleware())
	r.Use(canonicalLogger(log.Desugar()))
	r.Get("/metrics", promhttp.Handler().ServeHTTP)
	r.Get("/api/check", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "%s\n", "ok")
	})
	r.Mount("/api/auth", AuthRouter(conn, auther, jwtSecret, mailer, mailHost, bp))
	r.Mount("/api/files", FileRouter(conn, jwtSecret, auther))
	r.Mount("/api/users", UserRouter(conn, jwtSecret, auther, blobURL))
	r.Mount("/api/friends", FriendRouter(conn, jwtSecret, auther, blobURL))
	// FileServer(r, "/", webRoot)
	return r
}

// FileServer is serving static files
func FileServer(r chi.Router, public string, static string) {

	if strings.ContainsAny(public, "{}*") {
		panic("FileServer does not permit URL parameters.")
	}

	root, _ := filepath.Abs(static)
	if _, err := os.Stat(root); os.IsNotExist(err) {
		panic("Static Documents Directory Not Found")
	}

	fs := http.StripPrefix(public, http.FileServer(http.Dir(root)))

	if public != "/" && public[len(public)-1] != '/' {
		r.Get(public, http.RedirectHandler(public+"/", 301).ServeHTTP)
		public += "/"
	}

	r.Get(public+"*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file := strings.Replace(r.RequestURI, public, "/", 1)
		if _, err := os.Stat(root + file); os.IsNotExist(err) {
			http.ServeFile(w, r, path.Join(root, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	}))
}

// From https://attilaolah.eu/2014/09/10/json-and-struct-composition-in-go/
type omit *struct{}

// CookieSettings are the default values used to set cookies
type CookieSettings struct {
	SameSite http.SameSite
	HTTPOnly bool
	Secure   bool
	Path     string
}

// BasicResponse just contain success flag
type BasicResponse struct {
	Errors  []*error `json:"errors,omitempty"`
	Success bool     `json:"success"`
}

// httpWriteError writes http error responses and logs it
func httpWriteError(w http.ResponseWriter, err error, message string, code int) {
	http.Error(w, fmt.Sprintf(`{"error":"%s","message":"%s"}`, err.Error(), message), code)
}

// httpWriteJSON writes a JSON string from provided data
func httpWriteJSON(w http.ResponseWriter, data interface{}) {
	b, err := json.Marshal(data)
	if err != nil {
		httpWriteError(w, err, "fail to prepare data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)

	w.Write(b)
}

// generateCookie creates standardised cookie to use with browser client
func (c *AuthController) generateCookie(ctx context.Context, jwt string, expires time.Time) http.Cookie {
	return http.Cookie{
		Name:     "jwt",
		Value:    jwt,
		Expires:  expires,
		HttpOnly: c.cookieDefaults.HTTPOnly,
		Path:     c.cookieDefaults.Path,
		SameSite: c.cookieDefaults.SameSite,
		Secure:   c.cookieDefaults.Secure,
	}
}
