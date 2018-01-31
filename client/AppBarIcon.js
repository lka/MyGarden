import React from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const MyMenu = (props) => (
  <IconMenu
    iconButtonElement={
      <IconButton><MoreVertIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <MenuItem primaryText="Configure" onClick={props.showSelectObjects} />
    <MenuItem primaryText="Help" onClick={props.showHelp} />
    <Divider />
    <MenuItem primaryText="About" onClick={props.showAbout} />
  </IconMenu>
);

export default class AppBarIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <AppBar
        title="MyGarden"
        iconElementRight={
          <MyMenu
            showAbout={this.props.showAbout}
            showHelp={this.props.showHelp}
            showSelectObjects={this.props.showSelectObjects}
          />
        }
      />
    );
  }
}
