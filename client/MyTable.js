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
    numSelected,
    rowCount} = this.props;
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
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
  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.selections,
      page: 0,
      rowsPerPage: 5,
      editing: false
    }
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.displayRows = this.displayRows.bind(this);
  }

  handleClick(event, id) {
    if (this.state.editing === false) {
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
      this.props.handleRowSelection(newSelected);
    }
  };

  handleChangePage(event, page) {
    this.setState({ page });
  };

  handleChangeRowsPerPage(event) {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected(id) {return this.state.selected.indexOf(id) !== -1};
  displayRows( v ) {return (parseInt(v.from)+'-'+parseInt(v.to)+' '+this.props.texts.Of+' '+parseInt(v.count))};

  render() {
  const { selected, rowsPerPage, page } = this.state;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.data.length - page * rowsPerPage);

  return (
    <Table>
      <EnhancedTableHead
        header={this.props.header}
        numSelected={this.state.selected.length}
        onSelectAllClick={this.handleSelectAllClick}
        rowCount={this.props.data.length}
      />
      <TableBody>
      {this.props.data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n, i) => {
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
            <TableCell key={`tc-${i}`}>
              {currentlyEditing ? (
                <TextField
                  name={`name-${i}`}
                  onChange={e => this.props.handleChange(e, 'name', n.id)}
                  value={n.name}
                />
              ) : (
                n.name
              )}
            </TableCell>
          <TableCell>
            {currentlyEditing ? (
              <CheckIcon onClick={() => {this.setState({ editing: false }); this.props.stopEditing();}} />
            ) : (
              <EditIcon onClick={() => {this.setState({ editing: true }); this.props.startEditing(n.id);}} />
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
            labelRowsPerPage={this.props.texts.RowsPerPage}
            labelDisplayedRows={this.displayRows}
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
