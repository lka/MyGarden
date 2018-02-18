import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import AppBarIcon from './AppBarIcon';
import LeftNav from './LeftNav';
import AboutDlg from './AboutDlg';
import HelpDlg from './HelpDlg';
import withDataFetching from './withDataFetching';
import SelectObjectsDlg from './SelectObjectsDlg';
import Switches from './Switches';
import urlForSwitchesFromStorage from './urlForSwitches';
import RefreshIndicatorLoading from './RefreshIndicatorLoading';

// This container is a sibling in the DOM
const app = document.getElementById('app');
const theme = createMuiTheme({
  overrides: {
    MuiDrawer: {
      paper: {
        top: '8px'
      }
    }
  }
});

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showSelectObjects: false,
      error: null,
      isLoaded: false,
      triggerView: false
    };
    this.switches = [];

    this.getUpdatedValues = this.getUpdatedValues.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._showAbout = this._showAbout.bind(this);
    this._showHelp = this._showHelp.bind(this);
    this._showSelectObjects = this._showSelectObjects.bind(this);
    this._selectedObjectsChanged = this._selectedObjectsChanged.bind(this);
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    if (error) {
      this.setState({ error });
    }
  }

  _handleClick(e) {
    e.preventDefault();

    // Show/Hide the Left Menu
    this.refs.leftNav.setState({open: true});
  }

  _showAbout(e) {
    // Show the About Dlg
    this.refs.aboutDlg.setState({open: true});
    this.refs.leftNav.setState({open: false});
  }

  _showSelectObjects(e) {
    // Show the SelectObjects Dlg
    this.setState({showSelectObjects: !this.state.showSelectObjects});
    this.refs.leftNav.setState({open: false});
  }

  _showHelp(e) {
    // Show the Help Dlg
    this.refs.helpDlg.setState({open: true});
    this.refs.leftNav.setState({open: false});
  }

  componentDidMount() {
    this.readBinaries();
  }

  componentWillUnmount() {
    this.cancelObservation();
    clearInterval(this.timer);
  }

  _selectedObjectsChanged() {
    this.cancelObservation();
    clearInterval(this.timer);
    this.readBinaries();
  }

  renderOverlays() {
    const SelectObjectsWrapper = withDataFetching(SelectObjectsDlg,
      urlForSwitchesFromStorage('objects'),
      this._showSelectObjects, this._selectedObjectsChanged);
    switch (true) {
      case this.state.error:
        return <div>Error: {this.state.error.message}</div>;
        break;
      case !this.state.isLoaded:
        return <RefreshIndicatorLoading />
        break;
      case this.state.showSelectObjects:
        return <SelectObjectsWrapper />
        break;
      default:
      return null;

    }
  }

  render() {
      return (
        <MuiThemeProvider theme={theme}>
        <div>
          <LeftNav
            ref='leftNav'
            showAbout={this._showAbout}
            showHelp={this._showHelp}
            showSelectObjects={this._showSelectObjects}
             />
          <AboutDlg ref='aboutDlg' />
          <HelpDlg ref='helpDlg' />
          {this.renderOverlays()}
          <AppBarIcon
            onLeftIconButtonClick={this._handleClick}
          />
          <Switches
            switches={this.switches}
          />
        </div>
        </MuiThemeProvider>
      );
  }

  // the helpers
  readBinaries() {
    fetch(urlForSwitchesFromStorage('binaries'))
    .then(d => d.json())
    .then(d => {
      this.switches = d.map(v => { return {'id': v.id, 'name': v.name, 'objectType': v.objectType, 'state': -1}; })
      this.getUpdatedValues();
      this.timer = setInterval(this.getUpdatedValues, 5000);
      this.setState({ isLoaded: true });
      this.setState(prevState => ({ triggerView: !prevState.triggerView }))
    },
    error => {
      this.setState({
        isLoaded: true,
        error
      })
    });
  }

  getUpdatedValues() {
    fetch(urlForSwitchesFromStorage('changes'))
    .then(d => d.json())
    .then(d => {
      if (d.length > 0) {
        console.log('getUpdatedValues succeeded with response', d);
        d.forEach(x => {
          const i = this.switches.findIndex(z => z.id === x.id);
          if (i != -1) {
            this.switches[i].state = x.state;
          }
        });
        this.setState(prevState => ({ toggleView: !prevState.toggleView }));
      }
    },
    error => {
      console.log('getUpdatedValues has error response', error);
      this.switches.forEach(item => { if (item.state !== DefaultState) { item.state = DefaultState; item.val = DefaultSwitch; } });
      this.setState(prevState => ({ toggleView: !prevState.toggleView }));
    });
  }

  cancelObservation() {
    fetch(urlForSwitchesFromStorage('cancel'), {
      method: 'PUT'
    })
    .then(data => {
      console.log('Request succeeded with response', data);
    })
    .catch(error => {
      console.log('Request failed', error);
    })
  }
}

ReactDOM.render(  <App />, app );
