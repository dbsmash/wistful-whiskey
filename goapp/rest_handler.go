package goapp

import (
	"encoding/json"
	"net/http"
	"time"
	"sort"
	"strings"

	"appengine"
	"appengine/datastore"
	"appengine/user"
)

type Tasting struct {
	Date              time.Time      `datastore:"date" json:"date"`
	Name     		  string         `datastore:"name" json:"name"`
	Distillery        string         `datastore:"distillery" json:"distillery"`
	Age               string         `datastore:"age" json:"age"`
	Color     		  string         `datastore:"color" json:"color"`
	Nose     		  string         `datastore:"nose" json:"nose"`
	Taste     		  string         `datastore:"taste" json:"taste"`
	Finish     		  string         `datastore:"finish" json:"finish"`
	Notes     		  string         `datastore:"notes" json:"notes"`
	Rating            int            `datastore:"rating" json:"rating"`
	Key               *datastore.Key `datastore:"-" json:"key"`
}

type ByDate []Tasting
func (a ByDate) Len() int           { return len(a) }
func (a ByDate) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByDate) Less(i, j int) bool { return !a[i].Date.Before(a[j].Date) }

func handleGet(writer http.ResponseWriter, request *http.Request, namespace appengine.Context) {
	var tastings []Tasting

	query := datastore.NewQuery("Tasting")
	keys, _ := query.GetAll(namespace, &tastings)
	
	for i, key := range keys {
		tastings[i].Key = key
	}

	sort.Sort(ByDate(tastings))
	
	response, _ := json.Marshal(tastings)
	writer.Write(response)
}

func handlePost(writer http.ResponseWriter, request *http.Request, namespace appengine.Context) {
	p := make([]byte, request.ContentLength)    
	_, err := request.Body.Read(p)

	if err == nil {
	    var tasting Tasting
	    err1 := json.Unmarshal(p, &tasting)
	    tasting.Date = time.Now()
	    if err1 == nil {
	        key := datastore.NewKey(namespace, "Tasting", "", 0, nil)
			datastore.Put(namespace, key, &tasting)
			tasting.Key = key
			response, _ := json.Marshal(tasting)
			writer.Write(response)
	    } else {
	        namespace.Infof("Unable to unmarshall the JSON request", err1);
	    }
	}
}

func handlePut(writer http.ResponseWriter, request *http.Request, namespace appengine.Context) {
	p := make([]byte, request.ContentLength)    
	_, err := request.Body.Read(p)

	if err == nil {
	    var tasting Tasting
	    err1 := json.Unmarshal(p, &tasting)
	    tasting.Date = time.Now()
	    if err1 == nil {
			datastore.Put(namespace, tasting.Key, &tasting)
			response, _ := json.Marshal(tasting)
			writer.Write(response)
	    } else {
	        namespace.Infof("Unable to unmarshall the JSON request", err1);
	    }
	}
}

func handleDelete(writer http.ResponseWriter, request *http.Request, namespace appengine.Context) {
	keyName := request.URL.Path
	i := strings.Index(keyName, "/")
	keyName = keyName[i+1:]
	i = strings.Index(keyName, "/")
	keyName = keyName[i+1:]
	
	key, err := datastore.DecodeKey(keyName)
	var taste Tasting
	err = datastore.Get(namespace, key, &taste)

	err = datastore.Delete(namespace, key)
	if err != nil {
		namespace.Infof("Yuck", err);
	}
}

func init() {
	http.HandleFunc("/tastings/", handleRequest)
}

func handleRequest(writer http.ResponseWriter, request *http.Request) {
	context := appengine.NewContext(request)
	user := user.Current(context)
	namespaceContext, _ := appengine.Namespace(context, user.ID)

	if request.Method == "GET" {
        handleGet(writer, request, namespaceContext)
    } else if request.Method == "POST" {
        handlePost(writer, request, namespaceContext)
    } else if request.Method == "DELETE" {
        handleDelete(writer, request, namespaceContext)
    } else if request.Method == "PUT" {
        handlePut(writer, request, namespaceContext)
    } else {
        http.Error(writer, "Invalid request method.", 405)
    }
}