/** @jsx React.DOM */

var React = require('react');
var Accordion = require('react-bootstrap').Accordion;
var Panel = require('react-bootstrap').Panel;
var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;

var mountNode = document.getElementById('app');

var eventDispatcher = {
  deleteCallbacks: [],
  addCallbacks: [],
  deleteEvent: function (key) {
    for (var i=0; i < this.deleteCallbacks.length; i++) {
      this.deleteCallbacks[i](key);
    }
  },

  onDeleteEvent: function (callback) {
    this.deleteCallbacks.push(callback);
  },

  addEvent: function (data) {
    for (var i=0; i < this.addCallbacks.length; i++) {
      this.addCallbacks[i](data);
    }
  },

  onAddEvent: function (callback) {
    this.addCallbacks.push(callback);
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

    $.ajax({
      method: 'POST',
      url: '/tastings/',
      data: JSON.stringify(newTasting),
      success: function (data) {
          eventDispatcher.addEvent(JSON.parse(data));
      }.bind(this),
        error: function (xhr, status, err) {
          console.error('onSave error');
      }.bind(this)
    });

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
                <td><Input type="text" ref="rating"/></td>
              </tr>
            </tbody>
            
          </Table>
          </form>
          <Button bsStyle="danger" onClick={this.onCancel}>Cancel</Button>
          <Button bsStyle="primary" onClick={this.onSave}>Save</Button>
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
    $.ajax({
      method: 'DELETE',
      url: '/tastings/' + this.key,
      success: function (data) {
          eventDispatcher.deleteEvent(this.key);
      }.bind(this),
        error: function (xhr, status, err) {
          console.error('handleDelete error');
      }.bind(this)
    });
  },

  render: function () {
    return (
        <Button bsStyle="danger" onClick={this.handleDelete}>Delete</Button>
    );
  }
});

var WhiskeyApp = React.createClass({
  loadTastingsFromServer: function () {
    $.ajax({url:'/tastings/',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
          this.setState({items: data});
        }.bind(this),
        error: function (xhr, status, err) {
          console.error('loadTastingsFromServer error');
        }.bind(this)
    });
  },

  onDeleteCallback: function(key) {
    var index = -1;
    for (var i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i].key === key) {
        index = i;
      }
    }
    if (index > -1) {
      this.state.items.splice(index, 1);
    }
    this.forceUpdate();
  },

  onAddCallback: function(data) {

    this.state.items.unshift(data);
    this.forceUpdate();
  },

  getInitialState: function () {
    eventDispatcher.onAddEvent(this.onAddCallback);
    eventDispatcher.onDeleteEvent(this.onDeleteCallback);
    return {items: [], text: ''};
  },

  onChange: function (e) {
    this.setState({text: e.target.value});
  },

  componentWillMount: function () {
    this.loadTastingsFromServer();
  },

  addNew: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.renderComponent(<AddNewPanel/>, mountNode);
  },

  render: function() {
    var gameNodes = this.state.items.map(function (item) {
      var formattedDate = item.date.substring(0, 10);
      return (
            <Panel header={item.distillery + ' ' + item.name} key={item.key}>
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
            <DeleteButton key={item.key}></DeleteButton>
            </Panel>
      );
    }.bind(this));

    return (
      <div>
        <h3>Wistful Whiskey</h3>
        <Button bsStyle="primary" onClick={this.addNew}>Add New Tasting</Button>
        <div id="new-tasting-panel"/>
        <div id="tasting-panel">
          <Accordion>
            {gameNodes}
          </Accordion>
        </div>
      </div>
    );
  }
});


React.renderComponent(<WhiskeyApp />, mountNode);

