import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import Menu, {MenuItem} from 'material-ui/Menu';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
// import NavigationClose from 'material-ui/svg-icons/navigation/close';
import NavigationClose from 'material-ui-icons/Close';
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
    <Drawer open={this.state.open} containerStyle={{ margin: 8+'px' }}>
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
