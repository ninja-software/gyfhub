package api

import (
	"bytes"
	gyfhub "gyfhub/server"
	"gyfhub/server/db"
	"gyfhub/server/helpers"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
	"github.com/ninja-software/terror"
)

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

type Hub struct {
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
	hub *Hub

	clientID string
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
		c.hub.broadcast <- message
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

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
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

type WebsocketController struct {
	Conn      *sqlx.DB
	JwtSecret string
	Auther    *gyfhub.Auther
	BlobURL   string
	Hubs      map[string]*Hub
}

func WebsocketRouter(
	conn *sqlx.DB,
	jwtSecret string,
	auther *gyfhub.Auther,
	blobURL string,
	hubs map[string]*Hub,
) chi.Router {
	c := &WebsocketController{
		conn,
		jwtSecret,
		auther,
		blobURL,
		hubs,
	}

	r := chi.NewRouter()
	r.Get("/", WithError(WithMember(conn, jwtSecret, c.all)))
	r.HandleFunc("/{id}", WithError(WithMember(conn, jwtSecret, c.handleServeWs)))
	// build new handler: "/{id}" -- connect to a certain hub

	return r
}

// all return all the hubs
func (c *WebsocketController) all(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	resp, err := db.Hubs().All(c.Conn)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}
	return helpers.EncodeJSON(w, resp)
}

func (c *WebsocketController) handleServeWs(w http.ResponseWriter, r *http.Request, u *db.User) (int, error) {
	hubID := chi.URLParam(r, "id")

	// find hub
	h, err := db.FindHub(c.Conn, hubID)
	if err != nil {
		return http.StatusBadRequest, terror.New(err, "")
	}

	// check the hub is in the active hub list
	if _, ok := c.Hubs[h.ID]; !ok {
		// create new hub connection
		c.Hubs[h.ID] = newHub()
		go c.Hubs[h.ID].run()
	}

	// create websocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return http.StatusInternalServerError, terror.New(err, "")
	}

	// set up the client
	client := &Client{hub: c.Hubs[h.ID], ws: ws, send: make(chan []byte, 256), clientID: u.ID}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.readPump()
	go client.writePump()

	// successfully connected
	return helpers.EncodeJSON(w, true)
}
