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

  handleClick(i) {
    const device = this.state.device.map((v, index) => {
      return {'id': v.id, 'name': v.name, 'val': index == i ? (v.val + 1) % 3 : v.val};
    });
    fetch(urlForDevicesFromStorage('binary'), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.state.device.id,
        val: this.state.device.val
      })
    })

    this.setState({ device });
  }

  componentDidMount() {
    fetch(urlForDevicesFromStorage('binaries'))
       .then(d => d.json())
       .then(d => {
         this.setState({
           isLoaded: true,
           device: d.map((v, index) => { return {'id': v.id, 'name': v.name, 'val': v.val}; })
       });
     },
     error => {
       this.setState({
         isLoaded: true,
         error
       })
     });
   }

   renderButton(i) {
     const buttonText = ['Aus ', 'Ein ', 'Auto'];
     return <button key={i} onClick={() => this.handleClick(i)}> {buttonText[this.state.device[i].val]} </button>;
   }

   render() {
     const { error, isLoaded, device } = this.state;
     if (error) {
       return <div>Error: {error.message}</div>
     } else if (!isLoaded) {
       return <div>Loading...</div>;
     } else {
       const deviceList = device.map((dev, index) => { return <tr key={index}><td>{dev.name}</td><td>{this.renderButton(index)}</td></tr>; });
       return <table><tbody>{deviceList}</tbody></table>;
     }
   }
}

ReactDOM.render(
  <Device />,
  document.getElementById('app')
)
