/** @jsx React.DOM */

'use strict';

var React = require('react');
var Accordion = require('react-bootstrap').Accordion;
var Panel = require('react-bootstrap').Panel;
var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Input = require('react-bootstrap').Input;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;

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

var AddNewPanel = React.createClass({
  onCancel: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.unmountComponentAtNode(mountNode);
  },

  onSave: function () {
    var newTasting = {
      distillery: this.refs.distillery.getValue(),
      name: this.refs.name.getValue(),
      color: this.refs.color.getValue(),
      nose: this.refs.nose.getValue(),
      taste: this.refs.taste.getValue(),
      finish: this.refs.finish.getValue(),
      notes: this.refs.notes.getValue(),
      rating: Number(this.refs.rating.getValue())
    };

    if (!TastingStore.validateRating(newTasting)) {
      return;
    }

    TastingStore.addRemote(newTasting);

    var mountNode = document.getElementById('new-tasting-panel');
    React.unmountComponentAtNode(mountNode);
  },

  render: function () {
    return (
        <Panel header='Add New Tasting...' key="addNewPanel1234">
          <form>
          <Table striped bordered condensed hover>
            
            <tbody>
            <tr>
                <th width="10%">Distillery</th>
                <td><Input type="text" ref="distillery"/></td>
              </tr>
              <tr>
                <th>Name</th>
                <td><Input type="text" ref="name" /></td>
              </tr>
              <tr>
                <th>Color</th>
                <td><Input type="text" ref="color"/></td>
              </tr>
              <tr>
                <th>Nose</th>
                <td><Input type="text" ref="nose" /></td>
              </tr>
              <tr>
                <th>Taste</th>
                <td><Input type="text" ref="taste" /></td>
              </tr>
              <tr>
                <th>Finish</th>
                <td><Input type="text" ref="finish" /></td>
              </tr>
              <tr>
                <th>Notes</th>
                <td><Input type="textarea" ref="notes" /></td>
              </tr>
              <tr>
                <th>Rating</th>
                <td><Input type="text" placeholder="x (out of 100)" ref="rating"/></td>
              </tr>
            </tbody>
            
          </Table>
          </form>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={this.onSave}>Save</Button>
            <Button bsStyle="danger" onClick={this.onCancel}>Cancel</Button>
          </ButtonToolbar>
          </Panel>
    );
  }
});

var EditPanel = React.createClass({
  onCancel: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.unmountComponentAtNode(mountNode);
  },

  onSave: function () {
    var newTasting = {
      key: this.props.item.key,
      distillery: this.refs.distillery.getValue(),
      name: this.refs.name.getValue(),
      color: this.refs.color.getValue(),
      nose: this.refs.nose.getValue(),
      taste: this.refs.taste.getValue(),
      finish: this.refs.finish.getValue(),
      notes: this.refs.notes.getValue(),
      rating: Number(this.refs.rating.getValue())
    };

    if (!TastingStore.validateRating(newTasting)) {
      return;
    }

    TastingStore.editRemote(newTasting);

    var mountNode = document.getElementById('new-tasting-panel');
    React.unmountComponentAtNode(mountNode);
  },

  render: function () {
    return (
        <Panel header='Add New Tasting...' key="addNewPanel1234">
          <form>
          <Table striped bordered condensed hover>
            
            <tbody>
            <tr>
                <th width="10%">Distillery</th>
                <td><Input type="text" ref="distillery" defaultValue={this.props.item.distillery}/></td>
              </tr>
              <tr>
                <th>Name</th>
                <td><Input type="text" ref="name" defaultValue={this.props.item.name}/></td>
              </tr>
              <tr>
                <th>Color</th>
                <td><Input type="text" ref="color" defaultValue={this.props.item.color}/></td>
              </tr>
              <tr>
                <th>Nose</th>
                <td><Input type="text" ref="nose" defaultValue={this.props.item.nose}/></td>
              </tr>
              <tr>
                <th>Taste</th>
                <td><Input type="text" ref="taste" defaultValue={this.props.item.taste}/></td>
              </tr>
              <tr>
                <th>Finish</th>
                <td><Input type="text" ref="finish" defaultValue={this.props.item.finish}/></td>
              </tr>
              <tr>
                <th>Notes</th>
                <td><Input type="textarea" ref="notes" defaultValue={this.props.item.notes}/></td>
              </tr>
              <tr>
                <th>Rating</th>
                <td><Input type="text" ref="rating" placeholder="x (out of 100)"  defaultValue={this.props.item.rating}/></td>
              </tr>
            </tbody>
            
          </Table>
          </form>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={this.onSave}>Save</Button>
            <Button bsStyle="danger" onClick={this.onCancel}>Cancel</Button>
          </ButtonToolbar>
          </Panel>
    );
  }
});

var DeleteButton = React.createClass({
  getInitialState: function () {
    return {key: ''};
  },

  componentWillMount: function () {
    this.key = this.props.key;
  },

  handleDelete: function () {
    TastingStore.deleteRemote(this.key);
  },

  render: function () {
    return (
        <Button bsStyle="danger" onClick={this.handleDelete}>Delete</Button>
    );
  }
});

var EditButton = React.createClass({
  getInitialState: function () {
    return {key: ''};
  },

  componentWillMount: function () {
    this.key = this.props.key;
  },

  handleEdit: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.renderComponent(<EditPanel item={this.props.item}/>, mountNode);
  },

  render: function () {
    return (
        <Button bsStyle="primary" onClick={this.handleEdit}>Edit</Button>
    );
  }
});

var WhiskeyApp = React.createClass({
  getInitialState: function () {
    var app = this;

    TastingStore.addConsumer('load', function (data) {
      app.setState({items: data})
    });

    TastingStore.addConsumer('add', function (data) {
      app.replaceState({items: TastingStore.getTastings()});
    });

    TastingStore.addConsumer('edit', function (data) {
      app.replaceState({items: TastingStore.getTastings()});
    });

    TastingStore.addConsumer('delete', function (data) {
      app.replaceState({items: TastingStore.getTastings()});
    });

    TastingStore.addConsumer('search', function (data) {
      app.replaceState({items: data})
    });
    return {items: []};
  },

  componentWillMount: function () {
    TastingStore.load();
  },

  addNew: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.renderComponent(<AddNewPanel/>, mountNode);
  },

  sortByName: function () {
    TastingStore.sort('name');
  },

  sortByDate: function () {
    TastingStore.sort('date');
  },

  sortByDistillery: function () {
    TastingStore.sort('distillery');
  },

  sortByRating: function () {
    TastingStore.sort('rating');
  },

  doSearch: function () {
    TastingStore.search(this.refs.searchString.getValue().toLowerCase());
  },

  render: function() {
    var gameNodes = this.state.items.map(function (item) {
      var formattedDate = item.date.substring(0, 10);
      var header = item.distillery + ' ' + item.name;
      var inc = '';
      for (var property in item) {
        if (item.hasOwnProperty(property)) {
            if (!item[property] && property !== 'age') {
              inc = ' *';
            }
        }
      }
      return (
            <Panel header={header+inc} key={item.key}>
            <Table striped bordered condensed hover>
              <tbody>
                <tr>
                  <th width="10%">Reviewed</th>
                  <td>{formattedDate}</td>
                </tr>
                <tr>
                  <th>Color</th>
                  <td>{item.color}</td>
                </tr>
                <tr>
                  <th>Nose</th>
                  <td>{item.nose}</td>
                </tr>
                <tr>
                  <th>Taste</th>
                  <td>{item.taste}</td>
                </tr>
                <tr>
                  <th>Finish</th>
                  <td>{item.finish}</td>
                </tr>
                <tr>
                  <th>Notes</th>
                  <td><Panel>{item.notes}</Panel></td>
                </tr>
                <tr>
                  <th>Rating</th>
                  <td>{item.rating} / 100</td>
                </tr>
              </tbody>
            </Table>
            <ButtonToolbar>
            <EditButton item={item}></EditButton><DeleteButton key={item.key}></DeleteButton>
            </ButtonToolbar>
            </Panel>
      );
    }.bind(this));

    return (
      <div>
        <h3>Wistful Whiskey</h3>
        <ButtonToolbar>
          <Button bsStyle="primary" onClick={this.addNew}>Add New Tasting</Button>
          <DropdownButton bsStyle="primary" title="Sort...">
            <MenuItem onClick={this.sortByDate} key="1">Date</MenuItem>
            <MenuItem onClick={this.sortByDistillery} key="2">Distillery</MenuItem>
            <MenuItem onClick={this.sortByName} key="3">Name</MenuItem>
            <MenuItem onClick={this.sortByRating} key="4">Rating</MenuItem>
          </DropdownButton>
        </ButtonToolbar>
        <Input type="text" ref="searchString" placeholder="Search your reviews..." onChange={this.doSearch}/>

        <div id="new-tasting-panel"/>
        <div id="tasting-panel">
          <Accordion>
            {gameNodes}
          </Accordion>
        </div>
        Showing {this.state.items.length} spirits
      </div>
    );
  }
});

var mountNode = document.getElementById('app');
React.renderComponent(<WhiskeyApp />, mountNode);
