import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import Divider from 'material-ui/Divider';


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
      <AppBar
        title="MyGarden"
        iconElementLeft={<IconButton onClick={this.handleToggle}><NavigationClose /></IconButton>}
      />
      <MenuItem primaryText="Configure" onClick={this.props.showSelectObjects} />
      <MenuItem primaryText="Help" onClick={this.props.showHelp} />
      <Divider />
      <MenuItem primaryText="About" onClick={this.props.showAbout} />
    </Drawer>
    );
  }
}
