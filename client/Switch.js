import React, {Component} from 'react';
import urlForSwitchesFromStorage from './urlForSwitches';
import Radio, {RadioGroup} from 'material-ui/Radio';

import Table, {TableCell} from 'material-ui/Table';

const styles = {
  radioButtonGroup: {
    display: 'flex',
  },
  radioButton: {
    width: 'auto',
    marginRight: '26px'
  },
};

// const buttonText = ['Off ', 'On ', 'Auto'];
const DefaultSwitch = 2;

export default class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: DefaultSwitch
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e, value) {
    // this.setState(prevState => ({ val: (prevState.val + 1) % buttonText.length}))
    this.setState({ val: parseInt(value)});
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
      <TableCell>
        <RadioGroup name="Switch" defaultSelected="2" onChange={this.handleClick} style={styles.radioButtonGroup}>
          <Radio
            value="0"
            label="Off"
            style={styles.radioButton}
          />
          <Radio
            value="1"
            label="On"
            style={styles.radioButton}
          />
          <Radio
            value="2"
            label="Auto"
            style={styles.radioButton}
          />
        </RadioGroup>
      </TableCell>
      // <TableRowColumn><button onClick={() => this.handleClick()}> {buttonText[this.state.val]} </button></TableRowColumn>
    )
  }
}
