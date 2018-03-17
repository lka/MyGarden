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
  import urlForSwitchesFromStorage from './urlForSwitches';
  import MyTable from './MyTable';
  import TimePicker from './TimePicker';

  /**
   * Dialog content can be scrollable.
   */
export default class Scheduler extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        disableButtons: false,
        open: true,
        id: this.props.id,
        values: [],
        times: [],
      };
      this.timePicker = '07:30';

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
      this.timePickerOnChange = this.timePickerOnChange.bind(this);
    }

    componentDidMount(){
      fetch(urlForSwitchesFromStorage('schedule')+'?id='+this.props.id, {
        method: 'GET'
      })
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          console.log('Request succeeded, but ', data);
        }
        this.setState({ values: data[0].val });
        this.setTimes();
        console.log('Request succeeded with response', data[0].val);
      })
      .catch(error => {
        console.log('Request failed', error);
      })
    }

    setTimes() {
      const times = [];
      if (this.state.values.length > 0) {
        for (let i = 0; i < this.state.values.length; ++i) {
          for (let index = 0; index < this.state.values[i].length; ++index) {
            times.push(this.state.values[i][index].time);
          }
        }
        times.sort();
      }
      this.setState({ times });
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
      const hm = this.timePicker.split(":");
      const times = this.state.times;
      const time1 = new Date(1, 1, 1);
      time1.setHours(parseInt(hm[0], 10), parseInt(hm[1], 10), 0, 0);
      if (times.findIndex(x => x == time1.toJSON()) === -1) {
        times.push(time1.toJSON());
        times.sort();
        this.setState({ times });
      }
    }

    pad(x) {
      return (x < 10) ? ('0' + x) : x;
    }

    dayFilter(day, val) {
      if (day !== undefined) {
        const retval = day.filter(d => d.time === val);
        if (retval.length > 0) {
          return retval[0].value;
        }
      }
      return '';
    }

    timePickerOnChange(e) {
      const { value } = e.target;
      this.timePicker = value;
    }

    render() {
      console.log('Scheduler::render called')
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
                  {this.state.times.map((time, i) => (
                    <TableRow key={`tr-${i}`}>
                      <TableCell>{this.pad((new Date(time)).getHours())+':'+this.pad((new Date(time)).getMinutes())}</TableCell>
                      {this.state.values.map((day, j) => (
                        <TableCell
                          key={`tc-${i}.${j}`}
                          padding='none'
                        >{this.dayFilter(day, time)}</TableCell>
                      ))}
                    </TableRow>
                  )
                  )}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <TimePicker
                onChange = {this.timePickerOnChange}
              />
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