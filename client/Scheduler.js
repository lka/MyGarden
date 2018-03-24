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
  import DeleteIcon from 'material-ui-icons/Delete';
  import Select from 'material-ui/Select';

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
        modified: false,
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
        { numeric: false, disablePadding: false, label: ''}
]
      this.handleClose = this.handleClose.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleAddTime = this.handleAddTime.bind(this);
      this.timePickerOnChange = this.timePickerOnChange.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleChangeSelect = this.handleChangeSelect.bind(this);
    }

    componentDidMount(){
      fetch(urlForSwitchesFromStorage('schedule')+'?id='+this.props.id, {
        method: 'GET'
      });
      setTimeout(()=>{
        fetch(urlForSwitchesFromStorage('schedule')+'?id='+this.props.id, {
          method: 'GET'
        })
        .then(res => res.json())
        .then(data => {
          this.setState({ id: data[0].id, name: data[0].name, values: data[0].val });
          this.setTimes();
          console.log('GET Request succeeded with response', data[0].val);
        })
        .catch(error => {
          console.log('GET Request failed', error);
        })
      }, 500);
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
      if (this.state.modified) {
        fetch(urlForSwitchesFromStorage('schedule'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: this.state.id, name: this.state.name, val: this.state.values })
        })
        .then(data => {
          console.log('POST Request succeeded with response', data);
        })
        .catch(error => {
          this.setState({ val: DefaultSwitch });
          console.log('POST Request failed', error);
        })
      }
      this.props.toggle();
    };

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
      return "";
    }

    timePickerOnChange(e, value) {
      this.timePicker = e.target.value;
    }

    handleDelete(e, value) {
      const times = this.state.times.filter(x => x !== value);
      const values = this.state.values;
      for (let i = 0; i < values.length; ++i) {
        if (values[i] !== undefined) {
          values[i] = values[i].filter(x => x.time !== value);
        }
      }
      this.setState({ times, values, modified: true });
    }

    handleChangeSelect(e, time, day) {
      const { value } = e.target;
      const val = parseInt(value);
      const values = this.state.values;
      const entry = values[day] !== undefined ? values[day].findIndex(x => x.time == time) : -1;
      if (entry === -1) {
        values[day].push({ time, type: 9, value: val });
        values[day] = values[day].sort((x, y) => {return (new Date(x.time)) - (new Date(y.time))})
      } else {
        if (isNaN(val)) {
          console.log(`handleChangeSelect Day:${day}[${time}] isNaN`, val);
          values[day].splice(entry, 1);
        } else {
          console.log(`handleChangeSelect Day:[${day}][${entry}](${time}) = `, val);
          values[day][entry].type = 9;
          values[day][entry].value = val;
        }
      }
      this.setState({ values, modified: true });

      console.log('handleChange', values);
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
              {this.props.texts.ModifyContent}
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
                      <TableCell key={`tc-${i}.first`}>{this.pad((new Date(time)).getHours())+':'+this.pad((new Date(time)).getMinutes())}</TableCell>
                      {this.state.values.map((day, j) => (
                        <TableCell
                          key={`tc-${i}.${j}`}
                          padding='none'
                        >
                          <Select native
                            key={`sel-${time}.${j}`}
                            onChange={e => this.handleChangeSelect(e, time, j)}
                            defaultValue={this.dayFilter(day, time)}>
                            <option value=""> </option>
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell
                        key={`tc-${i}.last`}
                      >
                        <Button
                          key={`btn-${time}.last`}
                          color='secondary'
                          aria-label="delete"
                          onClick={e => this.handleDelete(e, time)}
                        >
                          <DeleteIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                  )}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <TimePicker
                onChange={e => this.timePickerOnChange(e)}
                texts={this.props.texts}
              />
              <Button
                color='secondary'
                disabled={this.state.disableButtons}
                onClick={this.handleAddTime}>
                {this.props.texts.AddTime}
              </Button>
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
