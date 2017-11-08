package main

//go:generate tplize --out templated.go index.html

import (
	"container/list"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"golang.org/x/net/websocket"

	"github.com/otiai10/marmoset"
	"github.com/otiai10/ternary"
)

// The list of participants.
// FIXME: It's not necessary to be list.List, but it's easy for now :p
var participants = list.List{}

func main() {

	r := marmoset.NewRouter()

	// Basic http endpoints handler
	r.GET("/", top)

	// ws:// Request handler
	s := &websocket.Server{Handler: socket}
	r.GET("/socket", s.ServeHTTP)

	// Static files handler
	r.Static("/public", "./")

	port := ternary.Default("9090").String(os.Getenv("PORT"))
	log.Println("Listening on port:", port)

	http.ListenAndServe(":"+port, r)
}

func top(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "text/html")
	w.Write([]byte(Tpl["index.html"]))
}

func socket(conn *websocket.Conn) {

	// Add this request user to participants list.
	participation := participants.PushBack(conn)
	// FIXME: It's better to embed more information to participants list.
	//        For example, hmm..., yes, like "ID"

	rand.Seed(time.Now().Unix())
	id := fmt.Sprintf("#%02x%02x%02x", rand.Intn(255), rand.Intn(255), rand.Intn(255))
	logger := log.New(os.Stdout, fmt.Sprintf("[%s]\t", id), 0)

	defer func() {
		conn.Close()
		participants.Remove(participation) // clean up
		logger.Println("Exited loop")
	}()

	// Sturct for decoding message from client side
	msg := struct {
		Text string
		Type string
	}{}

	// Struct for encoding message from server side
	event := struct {
		Text string `json:"text"`
		User string `json:"user"`
	}{}

	// {{{ FIXME: Tell who this request user is.
	event.Text = "yourself"
	event.User = id
	b, _ := json.Marshal(event)
	conn.Write(b)
	// }}}

	// This loop keeps alive unless any error raises.
	for {

		if err := websocket.JSON.Receive(conn, &msg); err != nil {
			if err == io.EOF {
				logger.Println("Connection closed:", err)
			} else {
				logger.Println("Unexpected error:", err)
			}
			return // Exit from this loop
		}

		switch msg.Type {
		default:
			event.Text = msg.Text
			event.User = id
			b, _ := json.Marshal(event)
			// Publish to all participants.
			for e := participants.Front(); e != nil; e = e.Next() {
				// FIXME: Type assertion validation :p
				// FIXME: Error handling on Write :p
				e.Value.(*websocket.Conn).Write(b)
			}
			// FIXME: It's better to make some func to separate this common process :p
		}

		// continue: Keep waiting for message from this connection.
	}

}
