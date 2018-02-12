import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

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
