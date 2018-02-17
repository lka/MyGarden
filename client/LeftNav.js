import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import {MenuList, MenuItem} from 'material-ui/Menu';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
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
    <Drawer open={this.state.open} style={{ margin: 8+'px' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="Menu" onClick={this.handleToggle}>
            <NavigationClose />
          </IconButton>
          <Typography variant="title" color="inherit" >
            MyGarden
          </Typography>
        </Toolbar>
      </AppBar>
      <MenuList role="menu">
        <MenuItem onClick={this.props.showSelectObjects}>Configure</MenuItem>
        <MenuItem onClick={this.props.showHelp}>Help</MenuItem>
        <Divider />
        <MenuItem onClick={this.props.showAbout}>About</MenuItem>
      </MenuList>
    </Drawer>
    );
  }
}
