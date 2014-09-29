package goapp

import (
    "net/http"
    "html/template"
)

func init() {
}


func TastingHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("dist/index.html"))
	err := tmpl.Execute(w, nil)
	if err != nil {
		panic(err)
	}
}