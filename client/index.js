import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppBarIcon from './AppBarIcon';
import LeftNav from './LeftNav';
import AboutDlg from './AboutDlg';
import HelpDlg from './HelpDlg';
import SelectObjectsDlg from './SelectObjectsDlg';
import {
  Table,
  TableBody,
  TableHeader,
  TableFooter,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const urlForSwitchesFromStorage = switches =>
  `http://localhost:3000/${switches}`
const valueText = ['Off ', 'On ', '---'];
const DefaultState = 2;
const buttonText = ['Off ', 'On ', 'Auto'];
const DefaultSwitch = 2;

// These two containers are siblings in the DOM
const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: this.props.val
    }
    this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
  }

  toggleCheckboxChange() {
    const { handleCheckboxChange, label, index } = this.props;

    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));
    handleCheckboxChange(index, !this.state.isChecked);
  }

  render() {
    const { label } = this.props;
    const { isChecked } = this.state;

    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            value={label}
            checked={isChecked}
            onChange={this.toggleCheckboxChange}
          />
          {label}
        </label>
      </div>
    );
  }
}

// Checkbox.propTypes = {
//   label: React.PropTypes.string.isRequired,
//   handleCheckboxChange: React.PropTypes.func.isRequired
// };

class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: DefaultSwitch
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({ val: (prevState.val + 1) % buttonText.length}))
    setTimeout(() => {
      fetch(urlForSwitchesFromStorage('binary'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.props.id,
          val: this.state.val
        })
      })
      .then(data => {
        if (!data.ok) {
          this.setState({ val: DefaultSwitch });
        }
        console.log('Request succeeded with response', data);
      })
      .catch(error => {
        this.setState({ val: DefaultSwitch });
        console.log('Request failed', error);
      })
    }, 100);
  }

  render() {
    return (
      <TableRowColumn><button onClick={() => this.handleClick()}> {buttonText[this.state.val]} </button></TableRowColumn>
    );
  }
}

class Switches extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      error: null,
      isLoaded: false,
      triggerView: false
    };
    this.switches = [];
    this.myObjects = [];

    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
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
    e.preventDefault();
    // Show the SelectObjects Dlg
    this.refs.selectObjectsDlg.setState({open: true});
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

  toggleCheckbox(i, val) {
    // http://react.tips/checkboxes-in-react/
    console.log(`toggleCheckbox(${i}, ${val})`);
    this.setState({ objectChanged: true }) ;
    this.myObjects[i].val = val;
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.readBinaries();
    if (this.myObjects.length === 0) {
      this.readObjects();
    }
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
      console.log('myObjects sent: ', this.myObjects);
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
          <SelectObjectsDlg
            ref='selectObjectsDlg'
            myObjects={this.myObjects}
            />
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
  sendObjects() {
    fetch(urlForSwitchesFromStorage('objects'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.myObjects)
    })
    .then(data => {
      console.log('Request succeeded with response', data);
    })
    .catch(error => {
      console.log('Request failed', error);
    })
  }

  readObjects() {
    fetch(urlForSwitchesFromStorage('objects'))
    .then(d => d.json())
    .then(d => {
        this.myObjects = d.map(v => { return {'id': v.id, 'name': v.name, 'val': v.val }; });
        console.log('handleShow 2:', this.myObjects);
      },
      error => {
        this.setState({ error })
    });
  }

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

  renderObjectList() {
    console.log('renderObjectList has objects', this.myObjects);
    const objectList = this.myObjects.length > 0 ? this.myObjects.map((dest, index) => { return (
      <div key={index}>{this.renderCheckbox(dest.name, index, dest.val)}</div>
    )}) : [];

    return (
    <Modal>
      <div className="modal">
        <div className='section'>
          <div className='live-preview'>
            {objectList}
          </div>
       </div>
       <button onClick={this.handleHide} className='page-header__button'>OK</button>
      </div>
    </Modal>
   );
  }

  renderCheckbox(label, index, val) {
    return (
      <Checkbox
            label={label}
            handleCheckboxChange={this.toggleCheckbox}
            key={index}
            index={index}
            val={val}
        />
      );
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
