import React, { Component } from 'react';
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
import urlForWebSocket from './urlForWebSocket';
import RefreshIndicatorLoading from './RefreshIndicatorLoading';
import Text from './Texts';

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
      triggerView: false,
      language: 'de_DE'
    };
    this.switches = [];
    this.texts = [];
    this.ws = undefined;

    this.getUpdatedValues = this.getUpdatedValues.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._showAbout = this._showAbout.bind(this);
    this._showHelp = this._showHelp.bind(this);
    this._showSelectObjects = this._showSelectObjects.bind(this);
    this._selectedObjectsChanged = this._selectedObjectsChanged.bind(this);
    this.setLanguage = this.setLanguage.bind(this);

    this.setLanguage(this.state.language);
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
    this.ws = new WebSocket(urlForWebSocket(''));
    this.ws.onerror = e => this.setState({ error: `WebSocketError ${e.code} ${e.reason}` });
    this.ws.onclose = e => this.setState({ error: `WebSocketError ${e.code} ${e.reason}` });
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: 'readBinaries' }));
    };
    this.ws.onmessage = e => {
      const message = JSON.parse(e.data);
      console.log(message);
      switch (message.type) {
        case 'readBinaries': {
          this.readBinaries(message.value);
          break;
        }
        case 'changes': {
          this.getUpdatedValues(message.value);
          break;
        }
        default:
          break;
      }
    };
  }

  componentWillUnmount() {
    this.ws.close();
    this.cancelObservation();
  }

  _selectedObjectsChanged() {
    this.cancelObservation();
    this.ws.send(JSON.stringify({ type: 'readBinaries' }));
  }

  renderOverlays() {
    const SelectObjectsWrapper = withDataFetching(SelectObjectsDlg,
      this.ws,
      this._showSelectObjects, this._selectedObjectsChanged);
    switch (true) {
      case this.state.error:
        return <div>Error: {this.state.error.message}</div>;
        break;
      case !this.state.isLoaded:
        return <RefreshIndicatorLoading />
        break;
      case this.state.showSelectObjects:
        return <SelectObjectsWrapper
          texts = {this.texts}
          />
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
            texts={this.texts}
            setLanguage={this.setLanguage}
            language={this.language}
          />
          <AboutDlg
            ref='aboutDlg'
            texts={this.texts}
          />
          <HelpDlg
            ref='helpDlg'
            texts={this.texts}
          />
          {this.renderOverlays()}
          <AppBarIcon
            onLeftIconButtonClick={this._handleClick}
            texts={this.texts}
          />
          <Switches
            switches={this.switches}
            texts={this.texts}
            webSock={this.ws}
          />
        </div>
        </MuiThemeProvider>
      );
  }

  // the helpers
  readBinaries(d) {
      this.switches = d.objects.map(v => { return {'id': v.id, 'name': v.name, 'objectType': v.objectType, 'state': v.state || 2}; });
      if (d.language !== undefined){
        this.setLanguage(d.language);
      }
      this.setState({ isLoaded: true });
      this.setState(prevState => ({ triggerView: !prevState.triggerView }))
  }

  getUpdatedValues(d) {
    const DefaultState = 2;

      if (d.length > 0) {
        d.forEach(x => {
          const i = this.switches.findIndex(z => z.id === x.id);
          if (i != -1) {
            this.switches[i].state = x.state;
          }
        });
        this.setState(prevState => ({ toggleView: !prevState.toggleView }));
      }
  }

  cancelObservation() {
    this.ws.send(JSON.stringify({ type: 'cancel' }));
  }

  setLanguage(val) {
    this.texts = Text.find(x => x.language === val).texts;
    this.language = { language: Text.map(x => x.language), langSelected: val };
    if (this.state.language !== val) {
      this.setState({ language: val});
      this.ws.send(JSON.stringify({ type: 'writeLanguage', value: { language: val }}));
    }
  }
}

ReactDOM.render(  <App />, app );
