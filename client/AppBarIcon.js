import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

export default class AppBarIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" aria-label="Menu" onClick={this.props.onLeftIconButtonClick}>
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" >
              MyGarden
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
