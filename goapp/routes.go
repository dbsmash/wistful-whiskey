package goapp

import (
    "net/http"
)

func init() {
	http.HandleFunc("/", TastingHandler)
}