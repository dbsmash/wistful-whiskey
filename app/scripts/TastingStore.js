var TastingStore = {
  searchString: '',
  tastings: [],
  callbacks: {
    'add': [],
    'edit': [],
    'delete': [],
    'search' : [],
    'load': []
  },

  /**
    * verifies that the provided information contains a correctly formatted rating property
    */
  validateRating: function (tasting) {
    if (tasting.rating === '') {
      tasting.rating = 0;
    }
    if (isNaN(Number(tasting.rating)) || Number(tasting.rating) > 100 || Number(tasting.rating) < 0) {
      alert('Please enter a numeric value (0 - 100) for rating.');
      return false;
    }
    return true;
  },

  /**
    * abstract allows a listener to be registed for actions of a provided type
    */
  addConsumer: function (type, callback) {
    var relevantCallbacks = this.callbacks[type];
    relevantCallbacks.push(callback);
  },

  /**
    * Notifies every listener of a given type of a particular event by invoking their callbacks with data
    */
  notifyConsumers: function (type, data) {
    var relevantCallbacks = this.callbacks[type];
    for (var i = 0; i < relevantCallbacks.length; i++) {
      relevantCallbacks[i](data);
    }
  },

  /**
    * sorts the tasting list by the specified sort property
    */
  sort: function (sortProp) {
    if (sortProp === 'rating') {
      this.tastings.sort(function (a, b) {
        return b.rating - a.rating;
      });
    } else {
      this.tastings.sort(function (a, b) {
        return a[sortProp].localeCompare(b[sortProp]);
      });
    }
    
    this.notifyConsumers('load', this.tastings);
  },

  /**
    * loads a list of tastings from the server
    */
  load: function () {
    $.ajax({url: '/tastings/',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        if (data === null) {
          data = [];
        }
        this.tastings = data;
        this.notifyConsumers('load', data);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('loadTastingsFromServer error');
      }.bind(this)
    });
  },

  /**
    * Deletes a specific tasting (by key) from the local store
    */
  deleteLocal: function (key) {
    var index = -1;
    for (var i = 0; i < this.tastings.length; i++) {
      if (this.tastings[i].key === key) {
        index = i;
      }
    }
    if (index > -1) {
      this.tastings.splice(index, 1);
    }
    this.notifyConsumers('delete', this.tastings);
  },

  /**
    * deletes a tasting from the server, and then requests a local delete on success
    */
  deleteRemote: function (key) {
    $.ajax({
      method: 'DELETE',
      url: '/tastings/' + key,
      success: function (data) {
        this.deleteLocal(key);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('handleDelete error');
      }.bind(this)
    });
  },

  /**
    * adds a new tasting to the local store, and notifies listeners
    */
  addLocal: function (data) {
    this.tastings.unshift(data);
    this.notifyConsumers('add', this.tastings);
  },

  /**
    * loads a new tasting to the server, and then requests an update the local store on success
    */
  addRemote: function (tasting) {
    $.ajax({
      method: 'POST',
      url: '/tastings/',
      data: JSON.stringify(tasting),
      success: function (data) {
        this.addLocal(JSON.parse(data));
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('onSave error');
      }.bind(this)
    });
  },

  /**
    * updates a local copy of a tasting with changes and then informs listeners
    */
  editLocal: function (data) {
    var index = -1;
    for (var i = 0; i < this.tastings.length; i++) {
      if (this.tastings[i].key === data.key) {
        index = i;
      }
    }
    if (index > -1) {
      this.tastings[index] = data;
    }
    this.notifyConsumers('edit', this.tastings);
  },

  /**
    * requests an update to the server copy of a tasting, and then requests a local update on success
    */
  editRemote: function (tasting) {
    $.ajax({
      method: 'PUT',
      url: '/tastings/',
      data: JSON.stringify(tasting),
      success: function (data) {
        this.editLocal(JSON.parse(data));
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('editRemote error');
      }.bind(this)
    });
  },

  /**
    * filters the list of local tastings to those whose name/distillery match the searchString
    */
  search: function (searchString) {
    this.searchString = searchString;
    if (searchString === '') {
      this.notifyConsumers('search', this.tastings);
    }
    var matches  = [];
    for (var i = 0; i < this.tastings.length; i++) {
      if (this.tastings[i].name.toLowerCase().indexOf(searchString) > -1) {
        matches.push(this.tastings[i]);
      } else if (this.tastings[i].distillery.toLowerCase().indexOf(searchString) > -1) {
        matches.push(this.tastings[i]);
      }
    }
    this.notifyConsumers('search', matches);
  },

  /**
    * requests a list of all local tastings from this store
    */
  getTastings: function () {
    return this.search(this.searchString);
  }
};

module.exports = TastingStore;