import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

export default class LeftNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {open: false};

    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle() {
    this.setState({open: !this.state.open});
  }

render() {
  return (
    <Drawer open={this.state.open}>
      <MenuItem primaryText="Configure" onClick={this.handleToggle} />
      <MenuItem primaryText="Help" onClick={this.handleToggle} />
      </Drawer>
    );
  }
}
