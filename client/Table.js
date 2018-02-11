import React from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import EditIcon from "material-ui/svg-icons/image/edit";
import CheckIcon from "material-ui/svg-icons/navigation/check";
import TextField from "material-ui/TextField";

const row = (
  x,
  i,
  header,
  startEditing,
  editIdx,
  handleChange,
  stopEditing
) => {
  const currentlyEditing = editIdx === i;
  return (
    <TableRow key={`tr-${i}`} selectable={true} selected={x.val}>
      {header.map((y, k) => (
        <TableRowColumn key={`trc-${k}`}>
          {currentlyEditing ? (
            <TextField
              name={y.prop}
              onChange={e => handleChange(e, y.prop, i)}
              value={x[y.prop]}
            />
          ) : (
            x[y.prop]
          )}
        </TableRowColumn>
      ))}
      <TableRowColumn>
        {currentlyEditing ? (
          <CheckIcon onClick={() => stopEditing()} />
        ) : (
          <EditIcon onClick={() => startEditing(i)} />
        )}
      </TableRowColumn>
    </TableRow>
  );
};

export default ({
  data,
  header,
  handleRowSelection,
  startEditing,
  editIdx,
  handleChange,
  stopEditing
}) => (
  <Table multiSelectable={true} onRowSelection={handleRowSelection}>
    <TableHeader>
      <TableRow>
        {header.map((x, i) => (
          <TableHeaderColumn key={`thc-${i}`}>{x.name}</TableHeaderColumn>
        ))}
        <TableHeaderColumn />
        <TableHeaderColumn />
      </TableRow>
    </TableHeader>
    <TableBody deselectOnClickaway={false}>
      {data.map((x, i) =>
        row(
          x,
          i,
          header,
          startEditing,
          editIdx,
          handleChange,
          stopEditing
        )
      )}
    </TableBody>
  </Table>
);
