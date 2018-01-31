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

    this.isSelected = this.isSelected.bind(this);
    this.handleRowSelection = this.handleRowSelection.bind(this);
  }

  isSelected(index) {
    return this.state.selected.indexOf(index) !== -1;
  };

  handleRowSelection(selectedRows) {
    this.setState({
      selected: selectedRows,
    });
  };

  render() {
    console.log('myObjects received: ', this.props.myObjects);
    const tableRowItems = this.props.myObjects.map((dest, index) => {
      return (
        <TableRow key={index} selected={dest.val}>
          <TableRowColumn>{dest.name}</TableRowColumn>
        </TableRow>
        )});

    return (
      <Table multiSelectable={true} onRowSelection={this.handleRowSelection}>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRowItems}
        </TableBody>
      </Table>
    );
  }
}
