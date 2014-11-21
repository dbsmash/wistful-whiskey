/** @jsx React.DOM */
var React = require('react');
var Button = require('react-bootstrap').Button;
var TastingStore = require('./TastingStore');
var Panel = require('react-bootstrap').Panel;
var Table = require('react-bootstrap').Table;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Input = require('react-bootstrap').Input;

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

module.exports = EditPanel;