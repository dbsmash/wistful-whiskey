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

type UserC struct {
	Email    string    `datastore:"email"`
	Name     string    `datastore:"name"`
	User_id  string    `datastore:"user_id"`
	Active   time.Time `datastore:"active"`
	Premeium bool      `datastore:"premeium"`
	Deletes  int       `datastore: "deletes"`
	Gets     int       `datastore: "gets"`
	Adds     int       `datastore: "adds"`
	Edits    int       `datastore: "edits"`
}

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
	Image_url         string         `datastore:"image_url" json:"image_url"`
	Key               *datastore.Key `datastore:"-" json:"key"`
}

type ByDate []Tasting
func (a ByDate) Len() int           { return len(a) }
func (a ByDate) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByDate) Less(i, j int) bool { return !a[i].Date.Before(a[j].Date) }

func updateUser(operation string, namespace appengine.Context) {
	user := user.Current(namespace)
	key := datastore.NewKey(namespace, "UserC", user.ID, 0, nil)
	newUser := UserC{}
	err := datastore.Get(namespace, key, &newUser)
	if err != nil {
		newUser = UserC{
			Email: user.Email,
			Name: user.String(),
			User_id: user.ID,
			Active: time.Now(),
			Premeium: false,
			Deletes: 0,
			Adds: 0,
			Gets: 0,
			Edits: 0}
	}

	if operation == "GET" {
        newUser.Gets += 1
    } else if operation == "POST" {
        newUser.Adds += 1
    } else if operation == "DELETE" {
        newUser.Deletes += 1
    } else if operation == "PUT" {
        newUser.Edits += 1
    } 
    newUser.Active = time.Now()
    key, _ = datastore.Put(namespace, key, &newUser)
}

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
	        key := datastore.NewIncompleteKey(namespace, "Tasting", nil)
			key, _ = datastore.Put(namespace, key, &tasting)
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
	updateUser(request.Method, context)
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