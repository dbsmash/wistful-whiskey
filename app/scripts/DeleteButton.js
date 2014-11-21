/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap').Button;
var TastingStore = require('./TastingStore');

'use strict';
var DeleteButton = React.createClass({

  /**
    * REACT getInitialState
    * key: the keyname of tasting to delete, if the button is pressed
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
    * Requests that the TastingStore delete a specific tasting by keyname
    */
  handleDelete: function () {
    TastingStore.deleteRemote(this.key);
  },

  /**
    * REACT render
    */
  render: function () {
    return (
        <Button bsStyle="danger" onClick={this.handleDelete}>Delete</Button>
    );
  }
});

module.exports = DeleteButton;