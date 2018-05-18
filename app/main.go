package main

import (
	"fmt"
	"log"
	"net/http"
)

func index(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintf(w, "Hi there, I love %s!", req.URL.Path[1:])
}

func main() {
	http.HandleFunc("/", index)
	log.Fatal(http.ListenAndServe(":80", nil))
}
