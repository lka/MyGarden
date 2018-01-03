const urlForSwitchesFromStorage = switches =>
  `http://localhost:3000/${switches}`
const buttonText = ['Aus ', 'Ein ', 'Auto'];
const valueText = ['Aus ', 'Ein ', '---'];
const DefaultSwitch = 2;
const DefaultState = 2;

class Switches extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      switches: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.getUpdatedValues = this.getUpdatedValues.bind(this);
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
    const { error, isLoaded, switches } = this.state;
    if (error) {
       return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
       return <div>Loading...</div>;
    } else {
       const switchList = switches.map((dest, index) => { return <tr  key={index}>
         {this.renderName(dest.name)}
         {this.renderButton(index, dest.val)}
         {this.renderValue(dest.state)}
         </tr>; });
      return (
        <div>
          <div className='page-header'><h1 align='center'>MyGarden</h1></div>
          <div className='page-body'><table className='container'><tbody>{switchList}</tbody></table></div>
          <div className='page-footer'><h3 align='center'>H.Lischka, 2018</h3></div>
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
        console.log('Request succeeded with response', d);
        d.forEach(x => {
          const i = this.state.switches.findIndex(z => z.id === x.id);
          if (i != -1) {
            this.state.switches[i].state = x.state;
          }
        });
        this.setModifiedSwitch(0, null, null);
      }
    },
    error => {
      console.log('Request has error response', error);
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
    const newSwitch = Object.assign({}, this.state.switches);
    this.setState({ newSwitch });
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

  renderHeader() {
    // The click event on this button will bubble up to parent,
    // because there is no 'onClick' attribute defined
    return (
      <div className="header">
      <button>Click</button>
      </div>
    );
  }
}

ReactDOM.render(
  <Switches />,
  document.getElementById('app')
)
