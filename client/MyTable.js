import React from "react";
import Table, {
  TableBody,
  TableHead,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow
} from "material-ui/Table";
import Checkbox from 'material-ui/Checkbox';
// import EditIcon from "material-ui/svg-icons/image/edit";
// import CheckIcon from "material-ui/svg-icons/navigation/check";
import EditIcon from "material-ui-icons/Edit";
import CheckIcon from "material-ui-icons/Check";
import TextField from "material-ui/TextField";

class EnhancedTableHead extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {header,
    onSelectAllClick,
    numSelected,
    rowCount} = this.props;
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {header.map((column, i) => (
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
    );
  }
}

export default class MyTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selected: [],
      page: 0,
      rowsPerPage: 10
    }
  }

  handleSelectAllClick(event, checked) {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick(event, id) {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage(event, page) {
    this.setState({ page });
  };

  handleChangeRowsPerPage(event) {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected(id) {this.state.selected.indexOf(id) !== -1};

  render() {

// const row = (
//   x,
//   i,
//   header,
//   startEditing,
//   editIdx,
//   handleChange,
//   stopEditing
// ) => {
  const { selected, rowsPerPage, page } = this.state;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.data.length - page * rowsPerPage);

  return (
    <Table multiSelectable={true} onRowSelection={this.props.handleRowSelection}>
      <EnhancedTableHead
        header={this.props.header}
        numSelected={this.state.selected.length}
        onSelectAllClick={this.handleSelectAllClick}
        rowCount={this.props.data.length}
      />
      <TableBody>
      {this.props.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(n => {
        const currentlyEditing = this.props.editIdx === n.id;
        const isSelected = this.isSelected(n.id);
        return (
          <TableRow
            hover
            onClick={event => this.handleClick(event, n.id)}
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={-1}
            key={`tr-${i}`}
            selected={isSelected}
          >
          <TableCell padding="checkbox">
            <Checkbox checked={isSelected} />
          </TableCell>
          {this.props.header.map((y, k) => (
            <TableCell key={`trc-${k}`}>
              {currentlyEditing ? (
                <TextField
                  name={y.prop}
                  onChange={e => this.props.handleChange(e, y.prop, n.id)}
                  value={n[y.prop]}
                />
              ) : (
                n[y.prop]
              )}
            </TableCell>
          ))}
          <TableCell>
            {currentlyEditing ? (
              <CheckIcon onClick={() => this.props.stopEditing()} />
            ) : (
              <EditIcon onClick={() => this.props.startEditing(n.id)} />
            )}
          </TableCell>
        </TableRow>
      )})}
      {emptyRows > 0 && (
        <TableRow style={{ height: 49 * emptyRows }}>
          <TableCell colSpan={3} />
        </TableRow>
      )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            colSpan={3}
            count={this.props.data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </TableRow>
      </TableFooter>
      </Table>
    )
  }
}
