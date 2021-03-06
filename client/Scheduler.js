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
  import { MenuItem } from 'material-ui/Menu';
  import EditIcon from "material-ui-icons/Edit";
  import CheckIcon from "material-ui-icons/Check";

  import urlForWebSocket from './urlForWebSocket';
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
        modified: false,
        id: this.props.id,
        name: '',
        values: [],
        times: [],
        editing: undefined
      };
      this.timePicker = '07:30';

      this.header = [
        { numeric: false, disablePadding: false, label: this.props.texts.Time },
        { numeric: false, disablePadding: true, label: this.props.texts.Week[0]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[1]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[2]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[3]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[4]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[5]},
        { numeric: false, disablePadding: true, label: this.props.texts.Week[6]},
        { numeric: false, disablePadding: true, label: this.props.texts.Edit},
        { numeric: false, disablePadding: true, label: this.props.texts.Delete}
]
      this.handleClose = this.handleClose.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleAddTime = this.handleAddTime.bind(this);
      this.timePickerOnChange = this.timePickerOnChange.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleChangeSelect = this.handleChangeSelect.bind(this);
      this.startEditing = this.startEditing.bind(this);
      this.stopEditing = this.stopEditing.bind(this);
    }

    componentDidMount(){
      console.log('Scheduler::didMount');
      this.webSock = new WebSocket(urlForWebSocket(''));
      this.webSock.onopen = () => {
        this.webSock.onmessage = e => {
          const message = JSON.parse(e.data);
          console.log('Scheduler::componentDidMount', message);
          switch (message.type) {
            case 'readScheduleResponse': {
              this.setTimes(message);
              break;
            }
            default:
              break;
          }
        };
        this.webSock.send(JSON.stringify({ type: 'readSchedule', value: { id: this.props.id }}));
      }
    }

    setTimes(message) {
      let times = [];
      if (message.value.val.length > 0) {
        for (let i = 0; i < message.value.val.length; ++i) {
          for (let index = 0; index < message.value.val[i].length; ++index) {
            if (times.findIndex(x => x==message.value.val[i][index].time) === -1) {
              times.push(message.value.val[i][index].time);
            }
          }
        }
        times.sort();
      }
      this.setState({ id: message.value.id, name: message.value.name, values: message.value.val, times });
    }

    handleCancel(){
      // do nothing but close
      this.webSock.close();
      setTimeout(this.props.toggle,50);
    };

    handleClose() {
      // save all modified data
      if (this.state.modified) {
        this.webSock.send(JSON.stringify({ type: 'writeSchedule', value: { id: this.state.id, name: this.state.name, val: this.state.values }}));
      }
      this.webSock.close();
      setTimeout(this.props.toggle,50);
      // this.props.toggle();
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

    startEditing() {
      this.setState({ disableButtons: true });
    }

    stopEditing(props) {
      this.setState({ disableButtons: false });

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
                          {(this.state.editing === time) ? (
                            <Select
                              key={`sel-${time}.${j}`}
                              onChange={e => this.handleChangeSelect(e, time, j)}
                              value={this.dayFilter(day, time)}
                              displayEmpty
                            >
                              <MenuItem value=""> </MenuItem>
                              <MenuItem value={0}>{this.props.texts.valueTexts[0]}</MenuItem>
                              <MenuItem value={1}>{this.props.texts.valueTexts[1]}</MenuItem>
                            </Select>
                          ) : ( this.props.texts.valueTexts[this.dayFilter(day, time)] )}
                        </TableCell>
                      ))}
                      <TableCell
                        key={`tc-${i}.edit`}
                        padding='none'
                      >
                        {(this.state.editing === time) ? (
                          <CheckIcon key={`ico-${i}.ed`} onClick={() => {this.setState({ editing: undefined }); this.stopEditing();}} />
                        ) : (
                          <EditIcon key={`ico-${i}.ed`} onClick={() => {this.setState({ editing: time }); this.startEditing(time);}} />
                        )}
                      </TableCell>
                      <TableCell
                        key={`tc-${i}.last`}
                        padding='none'
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
