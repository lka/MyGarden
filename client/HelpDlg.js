import React from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
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
        open={this.state.open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Help</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            use configuration to select objects that will be presented
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color='primary'
            autoFocus
            onClick={this.handleClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
