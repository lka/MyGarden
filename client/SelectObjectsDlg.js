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
    this.state = {
      open: false
    };
    this.handleClose = this.handleClose.bind(this);
  }

  handleOpen(){
    this.setState({open: true});
  };

  handleClose() {
    this.setState({open: false});
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
    console.log('myObjects received: ', this.props.myObjects);

    return (
      <div>
        <Dialog
          title="Select objects to be presented"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
        <TableOfObjects
          myObjects={this.props.myObjects}
        />
        </Dialog>
      </div>
    );
  }
}
