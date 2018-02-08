import React from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

export default class AppBarIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <AppBar
        title="MyGarden"
        onLeftIconButtonClick={this.props.onLeftIconButtonClick}
        />
    );
  }
}
