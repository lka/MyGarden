import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableFooter,
  TableRow,
  TableCell,
} from 'material-ui/Table';
import Switch from './Switch';

const valueText = ['Off ', 'On ', '---'];
const DefaultState = 2;

export default class Switches extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table
        // selectable={false}
      >
        <TableHead
          // displaySelectAll={false}
        >
          <TableRow>
            <TableCell>Object Name</TableCell>
            <TableCell>Set Value To</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          // displayRowCheckbox={false}
        >
        {this.props.switches.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.name}</TableCell>
            {this.renderObject(item)}
            <TableCell>{valueText[item.state]}</TableCell>
          </TableRow>
        ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan="3" style={{textAlign: 'center'}}>
            H.Lischka, 2018
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
  }

  renderObject(item) {
    console.log('Switches.renderObject: ', item)
    switch (item.objectType) {
      case 4: // Binary-Output
        return this.renderSwitch(item.id, item.val);
      default:
        return <TableCell />
    }
  }

  renderSwitch(id, status) {
    return (
      <Switch
        id = {id}
        status = {status}
      />
    );
  }
}
