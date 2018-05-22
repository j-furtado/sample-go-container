package main

import (
	"html/template"
	"net/http"
)

func index(w http.ResponseWriter, req *http.Request) {
	t, _ := template.ParseFiles("Templates/index.html")
	t.Execute(w, "Hello World!")
}

func main() {
	http.HandleFunc("/", index)
	http.ListenAndServe(":8080", nil)
}
