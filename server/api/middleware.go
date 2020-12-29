package api

import (
	"bytes"
	"errors"
	gyfhub "gyfhub/server"
	"gyfhub/server/canlog"
	"gyfhub/server/db"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-chi/chi/middleware"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/prometheus/client_golang/prometheus"
	"go.uber.org/zap"
)

const (
	reqsName    = "chi_requests_total"
	latencyName = "chi_request_duration_milliseconds"
)

func WithError(next func(w http.ResponseWriter, r *http.Request) (int, error)) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		code, err := next(w, r)
		if err != nil {
			terror.Echo(err)
			http.Error(w, err.Error(), code)
			return
		}
	}
	return fn
}

// WithMember takes the DB connection and JWT secret, then pulls the user struct out of the DB to insert into the downstream handler
func WithMember(conn *sqlx.DB, jwtSecret string, next func(w http.ResponseWriter, r *http.Request, u *db.User) (int, error)) func(w http.ResponseWriter, r *http.Request) (int, error) {
	fn := func(w http.ResponseWriter, r *http.Request) (int, error) {
		cookie, err := r.Cookie("jwt")
		if err != nil {
			err := errors.New("user not signed in")
			return http.StatusUnauthorized, terror.New(err, "Not signed in, please sign in and try again.")
		}
		tokenString := cookie.Value
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})
		userID := ""
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			userID = claims[string(gyfhub.ClaimUserID)].(string)
		}
		if userID == "" {
			return http.StatusUnauthorized, terror.New(errors.New("not logged in"), "")
		}

		u, err := db.FindUser(conn, userID)
		if err != nil {
			return http.StatusBadRequest, terror.New(err, "")
		}
		return next(w, r, u)
	}
	return fn
}

// PromMiddleware is a handler that exposes prometheus metrics for the number of requests,
// the latency and the response size, partitioned by status code, method and HTTP path.
type PromMiddleware struct {
	reqs    *prometheus.CounterVec
	latency *prometheus.HistogramVec
}

var (
	dflBuckets = []float64{300, 1200, 5000}
)

// NewPromMiddleware returns a new prometheus Middleware handler.
func NewPromMiddleware() func(next http.Handler) http.Handler {
	var m PromMiddleware
	m.reqs = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Namespace: "gyfhub/server",
			Subsystem: "api",
			Name:      reqsName,
			Help:      "How many HTTP requests processed, partitioned by status code, method and HTTP path.",
		},
		[]string{"code", "method", "path", "ip"},
	)
	prometheus.MustRegister(m.reqs)

	m.latency = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Namespace: "gyfhub/server",
		Subsystem: "api",
		Name:      latencyName,
		Help:      "How long it took to process the request, partitioned by status code, method and HTTP path.",
	},
		[]string{"code", "method", "path", "ip"},
	)
	prometheus.MustRegister(m.latency)
	return m.handler
}
func (m *PromMiddleware) handler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(ww, r)
		ip := r.RemoteAddr
		if strings.Contains(ip, "127.0.0.1") || strings.Contains(ip, "[::1]") {
			ip = "127.0.0.1"
		}

		m.reqs.WithLabelValues(strconv.Itoa(ww.Status()), r.Method, r.URL.Path, ip).Inc()
		m.latency.WithLabelValues(strconv.Itoa(ww.Status()), r.Method, r.URL.Path, ip).Observe(float64(time.Since(start).Nanoseconds()) / 1000000)
	}
	return http.HandlerFunc(fn)
}

func canonicalLogger(logger *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			now := time.Now()
			ctx := gyfhub.WithCanonicalLogger(r.Context(), logger)
			canlog.Set(ctx, "start", now.Unix())
			canlog.Set(ctx, "ip", r.RemoteAddr)
			canlog.Set(ctx, "reqId", middleware.GetReqID(ctx))
			next.ServeHTTP(w, r.WithContext(ctx))
			canlog.Set(ctx, "duration_ms", fmt.Sprintf("%.02f", float64(time.Since(now).Microseconds())/1000))
			canlog.Set(ctx, "req_method", r.Method)
			canlog.Set(ctx, "req_uri", r.RequestURI)
			canlog.Set(ctx, "req_header", r.Header)

			// Read the content
			var bodyBytes []byte
			var bodyReadCloser io.ReadCloser
			if r.Body != nil {
				bodyBytes, _ = ioutil.ReadAll(r.Body)
				bodyReadCloser = ioutil.NopCloser(bytes.NewReader(bodyBytes))
			}
			// Restore the io.ReadCloser to its original state
			r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
			canlog.Set(ctx, "req_body", bodyReadCloser)

			// Use the content
			if gyfhub.ClaimExistsInContext(ctx, gyfhub.ClaimUserName) {
				username, _ := gyfhub.ClaimValueFromContext(ctx, gyfhub.ClaimUserName)
				canlog.Set(ctx, "username", username)
			}
			if gyfhub.ClaimExistsInContext(ctx, gyfhub.ClaimRoles) {
				roles, _ := gyfhub.ClaimValueFromContext(ctx, gyfhub.ClaimRoles)
				canlog.Set(ctx, "roles", roles)
			}
			if gyfhub.ClaimExistsInContext(ctx, gyfhub.ClaimUserID) {
				userID, _ := gyfhub.ClaimValueFromContext(ctx, gyfhub.ClaimUserID)
				canlog.Set(ctx, "user_id", userID)
			}
			canlog.Log(ctx, "request")
		}
		return http.HandlerFunc(fn)
	}

}
