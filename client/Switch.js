import React, {Component} from 'react';
import urlForSwitchesFromStorage from './urlForSwitches';

import {
  TableRowColumn,
} from 'material-ui/Table';

const buttonText = ['Off ', 'On ', 'Auto'];
const DefaultSwitch = 2;

export default class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: DefaultSwitch
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({ val: (prevState.val + 1) % buttonText.length}))
    setTimeout(() => {
      fetch(urlForSwitchesFromStorage('binary'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.props.id,
          val: this.state.val
        })
      })
      .then(data => {
        if (!data.ok) {
          this.setState({ val: DefaultSwitch });
        }
        console.log('Request succeeded with response', data);
      })
      .catch(error => {
        this.setState({ val: DefaultSwitch });
        console.log('Request failed', error);
      })
    }, 100);
  }

  render() {
    return (
      <TableRowColumn><button onClick={() => this.handleClick()}> {buttonText[this.state.val]} </button></TableRowColumn>
    );
  }
}
