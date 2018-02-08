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
            <TableHeaderColumn>Switch</TableHeaderColumn>
            <TableHeaderColumn>Value</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
        >
        {this.props.switches.map((item, index) => (
          <TableRow key={index}>
            <TableRowColumn>{item.name}</TableRowColumn>
            {this.renderSwitch(item.id, item.val)}
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

  renderSwitch(id, status) {
    return (
      <Switch
        id = {id}
        status = {status}
      />
    );
  }
}
