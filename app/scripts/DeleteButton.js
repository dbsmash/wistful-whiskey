/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap').Button;
var TastingStore = require('./TastingStore');

'use strict';
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

module.exports = DeleteButton;