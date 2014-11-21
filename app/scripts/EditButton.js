/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap').Button;
var TastingStore = require('./TastingStore');
var EditPanel = require('./EditPanel');

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

module.exports = EditButton;