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
    console.log('handleCancel', this.state)
    this.props.handleCancel();
    setTimeout(this.props.toggle,50);
  };

  handleClose() {
    console.log('handleClose', this.state)
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
          <DialogTitle id="alert-dialog-title">{this.props.texts.Configure}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
            {this.props.texts.SelectObjects}
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
              texts={this.props.texts}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color='primary'
              disabled={this.state.disableButtons}
              onClick={this.handleCancel}>
              {this.props.texts.Cancel}
            </Button>
            <Button
              disabled={this.state.disableButtons}
              onClick={this.handleClose}>
              {this.props.texts.Submit}
            </Button>
          </DialogActions>
        </Dialog>
    );
  }
}
