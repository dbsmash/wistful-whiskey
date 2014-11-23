/** @jsx React.DOM */

'use strict';

var React = require('react');

var TastingStore = require('./TastingStore');
var Accordion = require('react-bootstrap').Accordion;
var Panel = require('react-bootstrap').Panel;
var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Input = require('react-bootstrap').Input;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;

var DeleteButton = require('./DeleteButton');
var AddNewPanel = require('./AddNewPanel');
var EditButton = require('./EditButton');

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
                <tr>
                  <th>Image</th>
                  <td><img src={item.image_url} height="200px"/></td>
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
