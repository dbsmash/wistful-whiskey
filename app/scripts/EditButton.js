/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap').Button;
var TastingStore = require('./TastingStore');
var EditPanel = require('./EditPanel');

var EditButton = React.createClass({

  /**
    * REACT getInitialState
    * key: the keyname of tasting to edit, if the button is pressed
    */
  getInitialState: function () {
    return {key: ''};
  },

  /**
    * REACT componentWillMount
    */
  componentWillMount: function () {
    this.key = this.props.key;
  },

  /**
    * handles an edit request by mounting a new EditPanel in the editing space in the app
    */
  handleEdit: function () {
    var mountNode = document.getElementById('new-tasting-panel');
    React.renderComponent(<EditPanel item={this.props.item}/>, mountNode);
  },

  /**
    * REACT render
    */
  render: function () {
    return (
        <Button bsStyle="primary" onClick={this.handleEdit}>Edit</Button>
    );
  }
});

module.exports = EditButton;