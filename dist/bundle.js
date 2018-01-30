/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const urlForSwitchesFromStorage = switches => `http://localhost:3000/${switches}`;
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
    };
    this.toggleCheckboxChange = this.toggleCheckboxChange.bind(this);
  }

  toggleCheckboxChange() {
    const { handleCheckboxChange, label, index } = this.props;

    this.setState(({ isChecked }) => ({
      isChecked: !isChecked
    }));
    handleCheckboxChange(index, !this.state.isChecked);
  }

  render() {
    const { label } = this.props;
    const { isChecked } = this.state;

    return React.createElement(
      'div',
      { className: 'checkbox' },
      React.createElement(
        'label',
        null,
        React.createElement('input', {
          type: 'checkbox',
          value: label,
          checked: isChecked,
          onChange: this.toggleCheckboxChange
        }),
        label
      )
    );
  }
}

// Checkbox.propTypes = {
//   label: React.PropTypes.string.isRequired,
//   handleCheckboxChange: React.PropTypes.func.isRequired
// };

class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

class Switch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      val: DefaultSwitch
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({ val: (prevState.val + 1) % buttonText.length }));
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
      }).then(data => {
        if (!data.ok) {
          this.setState({ val: DefaultSwitch });
        }
        console.log('Request succeeded with response', data);
      }).catch(error => {
        this.setState({ val: DefaultSwitch });
        console.log('Request failed', error);
      });
    }, 100);
  }

  render() {
    return React.createElement(
      'td',
      null,
      React.createElement(
        'button',
        { onClick: () => this.handleClick() },
        ' ',
        buttonText[this.state.val],
        ' '
      )
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
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    if (error) {
      this.setState({ error });
    }
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
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
    this.setState({ objectChanged: true });
    this.myObjects[i].val = val;
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
      return React.createElement(
        'div',
        null,
        'Error: ',
        this.state.error.message
      );
    } else if (!this.state.isLoaded) {
      return React.createElement(
        'div',
        null,
        'Loading...'
      );
    } else {
      // Show a Modal on click.
      // (In a real app, don't forget to use ARIA attributes
      // for accessibility!)
      const modal = this.state.showModal ? this.renderObjectList() : null;
      const switchList = this.switches.length > 0 ? this.renderSwitchList() : [];
      return React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'page-header' },
          React.createElement(
            'div',
            { className: 'page-subheader__button' },
            React.createElement(
              'button',
              { onClick: this.handleShow, className: 'page-header__button' },
              '\u2699'
            )
          ),
          React.createElement(
            'div',
            { className: 'page-subheader' },
            React.createElement(
              'h1',
              { align: 'center' },
              'MyGarden'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'page-body' },
          switchList
        ),
        React.createElement(
          'div',
          { className: 'page-footer' },
          React.createElement(
            'h3',
            { align: 'center' },
            'H.Lischka, 2018'
          )
        ),
        modal
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
    }).then(data => {
      console.log('Request succeeded with response', data);
    }).catch(error => {
      console.log('Request failed', error);
    });
  }

  readObjects() {
    fetch(urlForSwitchesFromStorage('objects')).then(d => d.json()).then(d => {
      this.myObjects = d.map(v => {
        return { 'id': v.id, 'name': v.name, 'val': v.val };
      });
      console.log('handleShow 2:', this.myObjects);
      this.setState({ showModal: true });
    }, error => {
      this.setState({ error });
    });
  }

  readBinaries() {
    fetch(urlForSwitchesFromStorage('binaries')).then(d => d.json()).then(d => {
      this.setState({
        isLoaded: true
      });
      this.switches = d.map(v => {
        return { 'id': v.id, 'name': v.name, 'state': -1 };
      });
      this.getUpdatedValues();
      this.timer = setInterval(this.getUpdatedValues, 5000);
    }, error => {
      this.setState({
        isLoaded: true,
        error
      });
    });
  }

  getUpdatedValues() {
    fetch(urlForSwitchesFromStorage('changes')).then(d => d.json()).then(d => {
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
    }, error => {
      console.log('getUpdatedValues has error response', error);
      this.switches.forEach(item => {
        if (item.state !== DefaultState) {
          item.state = DefaultState;item.val = DefaultSwitch;
        }
      });
      this.setState(prevState => ({ toggleView: !prevState.toggleView }));
    });
  }

  cancelObservation() {
    fetch(urlForSwitchesFromStorage('cancel'), {
      method: 'PUT'
    }).then(data => {
      console.log('Request succeeded with response', data);
    }).catch(error => {
      console.log('Request failed', error);
    });
  }

  renderObjectList() {
    console.log('renderObjectList has objects', this.myObjects);
    const objectList = this.myObjects.length > 0 ? this.myObjects.map((dest, index) => {
      return React.createElement(
        'div',
        { key: index },
        this.renderCheckbox(dest.name, index, dest.val)
      );
    }) : [];

    return React.createElement(
      Modal,
      null,
      React.createElement(
        'div',
        { className: 'modal' },
        React.createElement(
          'div',
          { className: 'section' },
          React.createElement(
            'div',
            { className: 'live-preview' },
            objectList
          )
        ),
        React.createElement(
          'button',
          { onClick: this.handleHide, className: 'page-header__button' },
          'OK'
        )
      )
    );
  }

  renderCheckbox(label, index, val) {
    return React.createElement(Checkbox, {
      label: label,
      handleCheckboxChange: this.toggleCheckbox,
      key: index,
      index: index,
      val: val
    });
  }

  renderSwitchList() {
    return React.createElement(
      'table',
      { className: 'container' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement(
            'th',
            null,
            'Object Name'
          ),
          React.createElement(
            'th',
            null,
            'Switch'
          ),
          React.createElement(
            'th',
            null,
            'Value'
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        this.switches.map((item, index) => React.createElement(
          'tr',
          { key: index },
          React.createElement(
            'td',
            null,
            item.name
          ),
          this.renderSwitch(item.id, item.val),
          React.createElement(
            'td',
            null,
            valueText[item.state]
          )
        ))
      )
    );
  }

  renderSwitch(id, status) {
    return React.createElement(Switch, {
      id: id,
      status: status
    });
  }
}

ReactDOM.render(React.createElement(Switches, null), app);

/***/ })
/******/ ]);