import React, {Component} from 'react';
import Button from 'material-ui/Button';
import Table, {TableCell} from 'material-ui/Table';
import Scheduler from './scheduler';

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showScheduler: false };
    this.handleClick = this.handleClick.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleClick(e, value) {
    this.setState({ showScheduler: true });
  }

  handleToggle() {
    this.setState({ showScheduler: false });
  }

  render() {
    if (this.state.showScheduler) {
      // this.setState({ showScheduler: false });
      return (
        <Scheduler
          id={ this.props.id }
          toggle={ this.handleToggle }
          name={ this.props.name }
        />
      )
    } else return (
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
