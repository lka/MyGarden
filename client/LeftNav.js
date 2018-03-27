import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import Select from 'material-ui/Select';
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
  const { language, langSelected } = this.props.language;
  return (
    <Drawer open={this.state.open}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="Menu" onClick={this.handleToggle}>
            <NavigationClose />
          </IconButton>
          <Typography variant="title" color="inherit" >
            {this.props.texts.application}
          </Typography>
        </Toolbar>
      </AppBar>
      <MenuList role="menu">
        <MenuItem onClick={this.props.showSelectObjects}>{this.props.texts.Configure}</MenuItem>
        <MenuItem onClick={this.props.showHelp}>{this.props.texts.Help}</MenuItem>
        <Select
          key={`sel-lang`}
          onChange={e => this.props.setLanguage(e.target.value)}
          value={langSelected}
        >
        {language.map((lang, i) => (
          <MenuItem key={`mi-${i}`} value={lang}>{lang}</MenuItem>
        ))}
        </Select>
        <Divider />
        <MenuItem onClick={this.props.showAbout}>{this.props.texts.About}</MenuItem>
      </MenuList>
    </Drawer>
    );
  }
}
