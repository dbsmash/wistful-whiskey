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

  addConsumer: function (type, callback) {
    var relevantCallbacks = this.callbacks[type];
    relevantCallbacks.push(callback);
  },

  notifyConsumers: function (type, data) {
    var relevantCallbacks = this.callbacks[type];
    for (var i = 0; i < relevantCallbacks.length; i++) {
      relevantCallbacks[i](data);
    }
  },

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

  addLocal: function (data) {
    this.tastings.unshift(data);
    this.notifyConsumers('add', this.tastings);
  },

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

  getTastings: function () {
    return this.search(this.searchString);
  }
};

module.exports = TastingStore;