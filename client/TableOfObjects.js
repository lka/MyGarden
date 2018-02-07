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
    console.log('TableOfObjects render called: ', this.props.data);

    return (
      <Table multiSelectable={true} selectable={true} >
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
