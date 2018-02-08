import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TableOfObjects from './TableOfObjects';

/**
 * Dialog content can be scrollable.
 */
export default class SelectObjectsDlg extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(){
    this.props.handleCancel();
    this.props.toggle();
  };

  handleClose() {
    this.props.toggle();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose}
      />,
    ];
    console.log('SelectObjectsDlg render called ');

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
        <TableOfObjects
          data={this.props.data}
          handleClick={this.props.handleClick}
        />
        </Dialog>
      </div>
    );
  }
}
