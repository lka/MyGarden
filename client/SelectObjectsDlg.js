import React from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import MyTable from './MyTable';

/**
 * Dialog content can be scrollable.
 */
export default class SelectObjectsDlg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableButtons: false,
      open: true
    };

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
    return (
        <Dialog
          open={this.state.open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Configuration</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            Select objects to be presented
            </DialogContentText>
            <MyTable
              data={this.props.data}
              header={this.props.header}
              handleRowSelection={this.props.handleRowSelection}
              startEditing={this.startEditing}
              editIdx={this.props.editIdx}
              handleChange={this.props.handleChange}
              stopEditing={this.stopEditing}
              selections={this.props.selections}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color='primary'
              disabled={this.state.disableButtons}
              onClick={this.handleClose}>
              Cancel
            </Button>
            <Button
              disabled={this.state.disableButtons}
              onClick={this.handleClose}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
    );
  }
}
