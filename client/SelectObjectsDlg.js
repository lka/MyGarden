import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import Table from './Table';

/**
 * Dialog content can be scrollable.
 */
export default class SelectObjectsDlg extends React.Component {
  constructor(props) {
    super(props);
    this.state = { disableButtons: false };

    this.handleClose = this.handleClose.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.startEditing = this.startEditing.bind(this);
    this.stopEditing = this.stopEditing.bind(this);
  }

  handleCancel(){
    this.props.handleCancel();
    this.props.toggle();
  };

  handleClose() {
    this.props.toggle();
  };

  startEditing(i) {
    this.setState({disableButtons: true})
    this.props.startEditing(i);
  }

  stopEditing() {
    this.setState({disableButtons: false})
    this.props.stopEditing();
  }

  render() {
    const actions = [
      <Button
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
        disabled={this.state.disableButtons}
      />,
      <Button
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose}
        disabled={this.state.disableButtons}
      />,
    ];

    return (
      <div>
        <Dialog
          title="Select objects to be presented"
          actions={actions}
          modal={false}
          open={true}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
        <Table
          data={this.props.data}
          header={this.props.header}
          handleRowSelection={this.props.handleRowSelection}
          startEditing={this.startEditing}
          editIdx={this.props.editIdx}
          handleChange={this.props.handleChange}
          stopEditing={this.stopEditing}
        />
        </Dialog>
      </div>
    );
  }
}
