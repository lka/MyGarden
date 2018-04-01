import React, {Component} from 'react';
import Table, {
  TableBody,
  TableHead,
  TableFooter,
  TableRow,
  TableCell,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';

import Switch from './Switch';
import Schedule from './Schedule';

const DefaultState = 2;

export default class Switches extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Paper>
        <Table
            // selectable={false}
          >
            <TableHead
              // displaySelectAll={false}
            >
              <TableRow>
                <TableCell>{this.props.texts.ObjectName}</TableCell>
                <TableCell>{this.props.texts.SetValueTo}</TableCell>
                <TableCell>{this.props.texts.Value}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              // displayRowCheckbox={false}
            >
            {this.props.switches.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                {this.renderObject(item)}
                <TableCell>{this.props.texts.valueTexts[item.state]}</TableCell>
              </TableRow>
            ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan="3" style={{textAlign: 'center'}}>
                {this.props.texts.Copyright}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
    )
  }

  renderObject(item) {
    switch (item.objectType) {
      case 4: // Binary-Output
        return (
          <Switch
            id = {item.id}
            status = {item.val}
            texts = {this.props.texts}
            webSock= {this.props.webSock}
          />
        );
      case 17: // Schedule
        return (
          <Schedule
            id = {item.id}
            name = {item.name}
            texts = {this.props.texts}
          />
        );
      default:
        return <TableCell />
    }
  }
}
