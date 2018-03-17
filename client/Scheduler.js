import React, {Component} from 'react';
import Table, {
  TableBody,
  TableHead,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow
} from "material-ui/Table";

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
export default class Scheduler extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        disableButtons: false,
        open: true
      };

      this.header = [
        { numeric: false, disablePadding: false, label: 'Time'},
        { numeric: false, disablePadding: true, label: 'Mo'},
        { numeric: false, disablePadding: true, label: 'Tu'},
        { numeric: false, disablePadding: true, label: 'We'},
        { numeric: false, disablePadding: true, label: 'Th'},
        { numeric: false, disablePadding: true, label: 'Fr'},
        { numeric: false, disablePadding: true, label: 'Sa'},
        { numeric: false, disablePadding: true, label: 'So'},
        { numeric: false, disablePadding: false, label: 'X'}
]
      this.handleClose = this.handleClose.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleAddTime = this.handleAddTime.bind(this);
      this.startEditing = this.startEditing.bind(this);
      this.stopEditing = this.stopEditing.bind(this);
    }

    componentDidMountxxx(){
      fetch(urlForSwitchesFromStorage('schedule')+'?id='+this.props.id, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          this.setState({ id: this.props.id })
          this.setState({ values: data });
          console.log('Request succeeded, but ', data);
        }
        console.log('Request succeeded with response', data);
      })
      .catch(error => {
        console.log('Request failed', error);
      })
    }

    handleCancel(){
      console.log('handleCancel', this.state)
      // do nothing but close
      setTimeout(this.props.toggle,50);
    };

    handleClose() {
      console.log('handleClose', this.state)
      // save all modified data
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

    handleAddTime() {

    }

    render() {
      return (
          <Dialog
            open={this.state.open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{this.props.name}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
              Add, change or delete entries
              </DialogContentText>
              <Table>
                <TableHead>
                  <TableRow>
                  {this.header.map((column, i) => (
                      <TableCell
                        key={`trh-${i}`}
                        numeric={column.numeric}
                        padding={column.disablePadding ? 'none' : 'default'}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                <TableRow>
                  <TableCell>00:00</TableCell>
                </TableRow>
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button
                color='secondary'
                disabled={this.state.disableButtons}
                onClick={this.handleAddTime}>
                Add Time
              </Button>
              <Button
                color='primary'
                disabled={this.state.disableButtons}
                onClick={this.handleCancel}>
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
