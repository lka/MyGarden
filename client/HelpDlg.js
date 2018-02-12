import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/Button';

/**
 * A modal dialog can only be closed by selecting the action.
 */
export default class HelpDlg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.setState({open: false});
  };

  render() {
    const actions = [
      <Button
        label="OK"
        primary={true}
        onClick={this.handleClose}
      />,
    ];

    return (
        <Dialog
          title="Help"
          actions={actions}
          modal={true}
          open={this.state.open}
        >
          select objects to be presented first
        </Dialog>
    );
  }
}
