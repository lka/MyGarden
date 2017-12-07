//import React, { Component } from 'react';

const urlForDevicesFromStorage = device =>
  `http://localhost:3000/${device}`

class Device extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      device: []
    };
    this.handleClick = this.handleClick.bind(this);
  }

  setModifiedDevices(i, val, state) {
    if (val != null) this.state.device[i].val = val;
    if (state != null) this.state.device[i].state = state;
    const newdev = Object.assign({}, this.state.device);
    this.setState({ newdev });
  }

  handleClick(i) {
    // const device = this.state.device.map((v, index) => {
    //   return {'id': v.id, 'name': v.name, 'val': index == i ? (v.val + 1) % 3 : v.val, 'state': v.state};
    // });
    this.setModifiedDevices(i, (this.state.device[i].val + 1) % 3, null);
    // fetch(urlForDevicesFromStorage('binary/' + device[i].id + '/' + device[i].val), {
    fetch(urlForDevicesFromStorage('binary'), {
      method: 'POST',
      headers: {
        // 'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.device[i].id,
        val: this.state.device[i].val
      })
    })
    // .then(json => {
    //   console.log(json);
    // })
    .then(data => {
      if (!data.ok) {
        this.setModifiedDevices(i, null, 2);
      }
      console.log('Request succeeded with response', data);
    })
    .catch(error => {
      this.setModifiedDevices(i, null, 2);
      console.log('Request failed', error);
    })
  }

  componentDidMount() {
    fetch(urlForDevicesFromStorage('binaries'))
       .then(d => d.json())
       .then(d => {
         this.setState({
           isLoaded: true,
           device: d.map(v => { return {'id': v.id, 'name': v.name, 'val': 2, 'state': 2}; })
       });
     },
     error => {
       this.setState({
         isLoaded: true,
         error
       })
     });
   }

   renderName(name) {
     return <td>{name}</td>
   }

   renderButton(i, val) {
     const buttonText = ['Aus ', 'Ein ', 'Auto'];
     return <td><button key={i} onClick={() => this.handleClick(i)}> {buttonText[val]} </button></td>;
   }

   renderValue(val) {
     const valueText = ['Aus ', 'Ein ', '---'];
     return <td>{valueText[val]}</td>;
   }

   render() {
     const { error, isLoaded, device } = this.state;
     if (error) {
       return <div>Error: {error.message}</div>
     } else if (!isLoaded) {
       return <div>Loading...</div>;
     } else {
       const deviceList = device.map((dev, index) => { return <tr  key={index}>
         {this.renderName(dev.name)}
         {this.renderButton(index, dev.val)}
         {this.renderValue(dev.state)}
         </tr>; });
       return <table><tbody>{deviceList}</tbody></table>;
     }
   }
}

ReactDOM.render(
  <Device />,
  document.getElementById('app')
)
