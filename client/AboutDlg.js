import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/Button';

/**
 * A modal dialog can only be closed by selecting the action.
 */
export default class AboutDlg extends React.Component {
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
          title="About"
          actions={actions}
          modal={true}
          open={this.state.open}
        >
          Copyright H.Lischka, 2018
        </Dialog>
    );
  }
}
