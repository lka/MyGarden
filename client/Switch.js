import React, {Component} from 'react';
import urlForSwitchesFromStorage from './urlForSwitches';
import Radio, {RadioGroup} from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Table, {TableCell} from 'material-ui/Table';

const styles = {
  radioButtonGroup: {
    display: 'flex',
  },
  radioButton: {
    marginRight: '26px'
  },
};

// const buttonText = ['Off ', 'On ', 'Auto'];
const DefaultSwitch = "2";

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
    this.props.webSock.send(JSON.stringify({ type: 'writeBinary', value: {
      id: this.props.id,
      val: parseInt(e.target.value)
    }}));
    this.setState({ val: e.target.value });
  }

  render() {
    return (
      <TableCell>
      <div>
        <FormControlLabel control={
          <Radio
            checked={this.state.val === "0"}
            onChange={this.handleClick}
            value="0"
          />}
          label={this.props.texts.valueTexts[0]}
          style={styles.radioButton}
        />
        <FormControlLabel control={
          <Radio
            checked={this.state.val === "1"}
            onChange={this.handleClick}
            value="1"
          />}
          label={this.props.texts.valueTexts[1]}
          style={styles.radioButton}
        />
        <FormControlLabel control={
          <Radio
            checked={this.state.val === "2"}
            onChange={this.handleClick}
            value="2"
          />}
          label={this.props.texts.valueTexts[3]}
        />
      </div>
      </TableCell>
    )
  }
}
