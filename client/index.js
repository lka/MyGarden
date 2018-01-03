const urlForSwitchesFromStorage = switches =>
  `http://localhost:3000/${switches}`
const buttonText = ['Aus ', 'Ein ', 'Auto'];
const valueText = ['Aus ', 'Ein ', '---'];
const DefaultSwitch = 2;
const DefaultState = 2;

// These two containers are siblings in the DOM
const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');

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

class Switches extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      error: null,
      isLoaded: false,
      switches: []
    };

    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleClick = this.handleClick.bind(this);
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
    this.setState({ showModal: true });
  }

  handleHide() {
    this.setState({ showModal: false });
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
    // const { showModal, error, isLoaded, switches } = this.state;
    if (this.state.error) {
       return <div>Error: {this.state.error.message}</div>
    } else if (!this.state.isLoaded) {
       return <div>Loading...</div>;
    } else {
      // Show a Modal on click.
      // (In a real app, don't forget to use ARIA attributes
      // for accessibility!)
      const modal = this.state.showModal ? (
        <Modal>
          <div className="modal">
            <div>
              With a portal, we can render content into a different
              part of the DOM, as if it were any other React child.
            </div>
            This is being rendered inside the #modal-container div.
            <button onClick={this.handleHide}>Hide modal</button>
          </div>
        </Modal>
      ) : null;
      const switchList = this.state.switches.length > 0 ? this.state.switches.map((dest, index) => { return <tr  key={index}>
        {this.renderName(dest.name)}
        {this.renderButton(index, dest.val)}
        {this.renderValue(dest.state)}
        </tr>; }) : [];
      return (
        <div>
          <div align='right'><button onClick={this.handleShow} className='page-header__button'>⚙</button></div>
          <div className='page-header'><h1 align='center'>MyGarden</h1></div>
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

  renderName(name) {
    return <td>{name}</td>
  }

  renderButton(i, value) {
    return <td><button key={i} onClick={() => this.handleClick(i)}> {buttonText[value]} </button></td>;
  }

  renderValue(val) {
    return <td>{valueText[val]}</td>;
  }
}

ReactDOM.render(  <Switches />, app );
