import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

export default class TableOfObjects extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Table multiSelectable={true} selectable={true} onRowSelection={this.props.handleClick}>
        <TableHeader
          displaySelectAll={true}
          adjustForCheckbox={true}
          enableSelectAll={true}
        >
          <TableRow >
            <TableHeaderColumn tooltip="The Name">Name</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={true} deselectOnClickaway={false} >
          {this.props.data.map((row, index) => (
              <TableRow key={index} selectable={true} selected={row.val}>
                <TableRowColumn>{row.name}</TableRowColumn>
              </TableRow>
              ))}
        </TableBody>
      </Table>
    )
  }
}
