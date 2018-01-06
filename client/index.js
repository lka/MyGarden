const urlForSwitchesFromStorage = switches =>
  `http://localhost:3000/${switches}`
const buttonText = ['Off ', 'On ', 'Auto'];
const valueText = ['Off ', 'On ', '---'];
const DefaultSwitch = 2;
const DefaultState = 2;

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
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
}

class Switch extends React.Component {
  render() {
    return (
      <tr>
      <td>{this.props.name}</td>
      <td><button onClick={() => this.props.onClick()}> {this.props.buttonText} </button></td>
      <td>{this.props.valueText}</td>
      </tr>
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
      switches: []
    };
    this.myObjects = [];

    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.getUpdatedValues = this.getUpdatedValues.bind(this);
    this.setModifiedSwitch = this.setModifiedSwitch.bind(this);
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
    console.log('handleShow 1:', this.myObjects);
    fetch(urlForSwitchesFromStorage('objects'))
    .then(d => d.json())
    .then(d => {
        this.myObjects = d.map(v => { return {'id': v.id, 'name': v.name, 'val': v.val }; });
        console.log('handleShow 2:', this.myObjects);
        this.setState({ showModal: true });
      },
      error => {
        this.setState({ error })
    });
  }

  handleHide() {
    this.setState({ showModal: false });
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

  handleClick(i) {
    this.setModifiedSwitch(i, (this.state.switches[i].val + 1) % valueText.length, null);
    fetch(urlForSwitchesFromStorage('binary'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.switches[i].id,
        val: this.state.switches[i].val
      })
    })
    .then(data => {
      if (!data.ok) {
        this.setModifiedSwitch(i, null, DefaultState);
      }
      console.log('Request succeeded with response', data);
    })
    .catch(error => {
      this.setModifiedSwitch(i, null, DefaultState);
      console.log('Request failed', error);
    })
  }

  toggleCheckbox(i, val) {
    // http://react.tips/checkboxes-in-react/
    console.log(`toggleCheckbox(${i}, ${val})`);
    this.myObjects[i].val = val;
  }

  componentDidMount() {
    console.log('componentDidMount');
    fetch(urlForSwitchesFromStorage('binaries'))
    .then(d => d.json())
    .then(d => {
      this.setState({
        isLoaded: true,
        switches: d.map(v => { return {'id': v.id, 'name': v.name, 'val': DefaultSwitch, 'state': DefaultState}; })
      });
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

  componentWillUnmount() {
    this.cancelObservation();
    clearInterval(this.timer);
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

  render() {
    if (this.state.error) {
       return <div>Error: {this.state.error.message}</div>
    } else if (!this.state.isLoaded) {
       return <div>Loading...</div>;
    } else {
      // Show a Modal on click.
      // (In a real app, don't forget to use ARIA attributes
      // for accessibility!)
      const modal = this.state.showModal ? this.renderObjectList() : null;
      const switchList = this.state.switches.length > 0 ? this.state.switches.map((dest, index) => {
        return this.renderSwitch(dest.name, buttonText[dest.val], valueText[dest.state], index) }) : [];
      return (
        <div>
          <div align='right'><button onClick={this.handleShow} className='page-header__button'>⚙</button></div>
          <h1 align='center'>MyGarden</h1>
          <div className='page-body'><table className='container'><tbody>{switchList}</tbody></table></div>
          <div className='page-footer'><h3 align='center'>H.Lischka, 2018</h3></div>
          {modal}
        </div>
      );
    }
  }

  // the helpers
  getUpdatedValues() {
    fetch(urlForSwitchesFromStorage('changes'))
    .then(d => d.json())
    .then(d => {
      if (d.length > 0) {
        console.log('getUpdatedValues succeeded with response', d);
        d.forEach(x => {
          const i = this.state.switches.findIndex(z => z.id === x.id);
          if (i != -1) {
            this.state.switches[i].state = x.state;
          }
        });
        this.setModifiedSwitch(0, null, null);
        console.log('getUpdatedValues After:', this.state);
      }
    },
    error => {
      console.log('getUpdatedValues has error response', error);
      for (let i = 0; i < this.state.switches.length; i++) {
        if (this.state.switches[i].state != DefaultState) {
          this.setModifiedSwitch(i, DefaultSwitch, DefaultState);
        }
      }
    });
  }

  setModifiedSwitch(index, val, state) {
    if (val != null) this.state.switches[index].val = val;
    if (state != null) this.state.switches[index].state = state;
    this.setState({ date: new Date()});
    // const newSwitch = Object.assign({}, this.state.switches);
    // this.setState({ switches: newSwitch });
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
       <div align='right'><button onClick={this.handleHide} className='page-header__button'>OK</button></div>
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

  renderSwitch(name, buttonText, valueText, i) {
    return (
      <Switch
        name = {name}
        valueText = {valueText}
        buttonText = {buttonText}
        onClick = {() => this.handleClick(i)}
      />
    );
  }
}

ReactDOM.render(  <Switches />, app );
