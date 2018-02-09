import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableFooter,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
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
        selectable={false}
      >
        <TableHeader
          displaySelectAll={false}
        >
          <TableRow>
            <TableHeaderColumn>Object Name</TableHeaderColumn>
            <TableHeaderColumn>Set Value To</TableHeaderColumn>
            <TableHeaderColumn>Value</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
        >
        {this.props.switches.map((item, index) => (
          <TableRow key={index}>
            <TableRowColumn>{item.name}</TableRowColumn>
            {this.renderObject(item)}
            <TableRowColumn>{valueText[item.state]}</TableRowColumn>
          </TableRow>
        ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableRowColumn colSpan="3" style={{textAlign: 'center'}}>
            H.Lischka, 2018
            </TableRowColumn>
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
        return <TableRowColumn />
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
