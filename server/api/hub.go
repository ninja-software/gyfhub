package api

import (
	"bytes"
	"encoding/json"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"log"
	"net/http"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-chi/chi"
	"github.com/gofrs/uuid"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
	"github.com/volatiletech/sqlboiler/v4/boil"
)

// HubController holds connection data for handlers
type HubController struct {
	Conn     *sqlx.DB
	Auther   *gyfhub.Auther
	BlobURL  string
	HubConns map[string]*HubConn
}

// HubRouter router
func HubRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
	hubConns map[string]*HubConn,
) chi.Router {
	c := &HubController{
		conn,
		auther,
		blobURL,
		hubConns,
	}

	r := chi.NewRouter()
	r.Post("/create", WithError(WithMember(conn, jwtSecret, c.CreateHub)))
	r.Post("/all", WithError(WithMember(conn, jwtSecret, c.All)))

	// websocket handler
	r.HandleFunc("/{id}", WithError(WithMember(conn, jwtSecret, c.handleServeWs)))

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

// websocket code start message sending

// handleServeWs manage message sending
func (c *HubController) handleServeWs(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	hubID := chi.URLParam(r, "id")

	// find hub
	h, err := db.FindHub(c.Conn, hubID)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "")
	}

	ms, err := h.Messages().All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	// check the hub is in the active hub list
	if _, ok := c.HubConns[h.ID]; !ok {
		// create new hub connection
		c.HubConns[h.ID] = newHub()
		go c.HubConns[h.ID].run()
	}

	// create websocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	// set up the client
	client := &Client{hub: c.HubConns[h.ID], ws: ws, send: make(chan []byte, 256), client: u, dbConn: c.Conn, hubID: hubID}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.readPump()
	go client.writePump()

	b, err := json.Marshal(ms)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	client.send <- b

	// successfully connected
	return http.StatusOK, nil
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// HubConn store the hub channels
type HubConn struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *HubConn

	client *db.User

	hubID string

	dbConn *sqlx.DB

	// The websocket connection.
	ws *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type Message struct {
	*db.Message
	Sender *db.User `json:"sender"`
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.ws.Close()
	}()
	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { c.ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		spew.Dump("2222222222222222222222222222222222222222222222222222222222222222222222222222222222")
		// store messages
		m := &db.Message{
			Content:  string(message),
			SenderID: c.client.ID,
			HubID:    c.hubID,
		}

		err = m.Insert(c.dbConn, boil.Infer())
		if err != nil {
			spew.Dump(err)
			return
		}

		// build response message
		resp := []Message{
			{
				Message: m,
				Sender:  c.client,
			},
		}

		// marshal the object
		b, err := json.Marshal(resp)
		if err != nil {
			return
		}

		spew.Dump(string(b))

		c.hub.broadcast <- b
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			// spew.Dump(c.clientID)
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.ws.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.ws.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func newHub() *HubConn {
	return &HubConn{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *HubConn) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// websocket code end message sending
