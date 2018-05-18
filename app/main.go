package main

import (
	"io"
	"net/http"
)

func index(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, "Hello World!")
}

func main() {
	http.HandleFunc("/", index)
	http.ListenAndServe("0.0.0.0:80", nil)
}
