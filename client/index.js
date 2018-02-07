import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppBarIcon from './AppBarIcon';
import LeftNav from './LeftNav';
import AboutDlg from './AboutDlg';
import HelpDlg from './HelpDlg';
import withDataFetching from './withDataFetching';
import SelectObjectsDlg from './SelectObjectsDlg';
import Switch from './Switch';
import urlForSwitchesFromStorage from './urlForSwitches';

import {
  Table,
  TableBody,
  TableHeader,
  TableFooter,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const valueText = ['Off ', 'On ', '---'];
const DefaultState = 2;

// This container is a sibling in the DOM
const app = document.getElementById('app');

class Switches extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showSelectObjects: false,
      error: null,
      isLoaded: false,
      triggerView: false
    };
    this.switches = [];
    this.myObjects = [];

    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.getUpdatedValues = this.getUpdatedValues.bind(this);
    this._handleClick = this._handleClick.bind(this);
    this._showAbout = this._showAbout.bind(this);
    this._showHelp = this._showHelp.bind(this);
    this._showSelectObjects = this._showSelectObjects.bind(this);
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    if (error) {
      this.setState({ error });
    }
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  _handleClick(e) {
    e.preventDefault();

    // Show/Hide the Left Menu
    this.refs.leftNav.setState({open: true});
  }

  _showAbout(e) {
    e.preventDefault();
    // Show the About Dlg
    this.refs.aboutDlg.setState({open: true});
  }

  _showSelectObjects(e) {
    // e.preventDefault();
    // Show the SelectObjects Dlg
    this.setState({showSelectObjects: !this.state.showSelectObjects});
    // SelectObjectsDlg.handleOpen();
  }

  _showHelp(e) {
    e.preventDefault();
    // Show the Help Dlg
    this.refs.helpDlg.setState({open: true});
  }

  handleShow() {
    console.log('handleShow:', this.myObjects);
    this.setState({ objectChanged: false });
    if (this.myObjects.length === 0) {
      this.readObjects();
    } else {
      this.setState({ showModal: true });
    }
  }

  handleHide() {
    console.log('handleHide');
    this.setState({ showModal: false });
    if (this.state.objectChanged) {
      this.cancelObservation();
      this.sendObjects();
      this.readBinaries();
    }
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.readBinaries();
  }

  componentWillUnmount() {
    this.cancelObservation();
    clearInterval(this.timer);
  }

  render() {
    if (this.state.error) {
       return <div>Error: {this.state.error.message}</div>
    } else if (!this.state.isLoaded) {
       return <div>Loading...</div>;
    } else {
      const switchList = this.switches.length > 0 ? this.renderSwitchList() : null;
      const SelectObjectsWrapper = withDataFetching(SelectObjectsDlg,
        urlForSwitchesFromStorage('objects'),
        this._showSelectObjects);
      console.log('Switches: ', this.state.showSelectObjects);
      return (
        <MuiThemeProvider>
          <LeftNav
            ref='leftNav'
             />
          <AboutDlg
            ref='aboutDlg'
            />
          <HelpDlg
            ref='helpDlg'
            />
          {this.state.showSelectObjects ? <SelectObjectsWrapper /> : null}
          <AppBarIcon
            onLeftIconButtonClick={this._handleClick}
            showAbout={this._showAbout}
            showHelp={this._showHelp}
            showSelectObjects={this._showSelectObjects}
          />
          {switchList}
        </MuiThemeProvider>
      );
    }
  }

  // the helpers
  readBinaries() {
    fetch(urlForSwitchesFromStorage('binaries'))
    .then(d => d.json())
    .then(d => {
      this.setState({
        isLoaded: true
      });
      this.switches = d.map(v => { return {'id': v.id, 'name': v.name, 'state': -1}; })
      this.getUpdatedValues();
      this.timer = setInterval(this.getUpdatedValues, 5000);
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

  renderSwitchList() {
    return (
      <Table
        selectable={false}
      >
        <TableHeader
          displaySelectAll={false}
        >
          <TableRow>
            <TableHeaderColumn>Object Name</TableHeaderColumn>
            <TableHeaderColumn>Switch</TableHeaderColumn>
            <TableHeaderColumn>Value</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
        >
        {this.switches.map((item, index) => (
          <TableRow key={index}>
            <TableRowColumn>{item.name}</TableRowColumn>
            {this.renderSwitch(item.id, item.val)}
            <TableRowColumn>{valueText[item.state]}</TableRowColumn>
          </TableRow>
        ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableRowColumn colSpan="3" style={{textAlign: 'center'}}>
            H.Lischka, 2018
            </TableRowColumn>
          </TableRow>
        </TableFooter>
      </Table>
    )
  }

  renderSwitch(id, status) {
    return (
      <Switch
        id = {id}
        status = {status}
      />
    );
  }
}

ReactDOM.render(  <Switches />, app );
