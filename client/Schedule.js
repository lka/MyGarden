import React, {Component} from 'react';
import urlForSwitchesFromStorage from './urlForSwitches';
import Button from 'material-ui/Button';
import Table, {TableCell} from 'material-ui/Table';

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e, value) {
    fetch(urlForSwitchesFromStorage('schedule')+'?id='+this.props.id, {
      method: 'GET'
    })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        // this.setState({ val: DefaultSwitch });
        console.log('Request succeeded, but ', data);
      }
      console.log('Request succeeded with response', data);
    })
    .catch(error => {
      console.log('Request failed', error);
    })
  }

  render() {
    return (
      <TableCell>
        <Button
          color='primary'
          onClick={this.handleClick}>
          Modify Program
        </Button>
      </TableCell>
    )
  }
}
