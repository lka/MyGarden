//import React, { Component } from 'react';

const urlForDevicesFromStorage = device =>
  `http://localhost:3000/${device}`

class Device extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      device: []
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(ev) {
    // this.setState(prevState => ({
    //   device[ev.target.key].state: !prevState.device[ev.target.key].state
    // }));
    console.log('Click happened', dev);
  }

  componentDidMount() {
    fetch(urlForDevicesFromStorage('devices'))
       .then(d => d.json())
       .then(d => {
         this.setState({
           isLoaded: true,
           device: d.map((v, index) => { return {'name': v, 'state': 0}; })
       });
     },
     error => {
       this.setState({
         isLoaded: true,
         error
       })
     });
   }

    render() {
      const { error, isLoaded, device } = this.state;
      if (error) {
        return <div>Error: {error.message}</div>
      } else if (!isLoaded) {
        return <div>Loading...</div>;
      } else {
        const deviceList = device.map((dev, index) => { return <li key={index}> {dev.name} <button key={index} onClick={this.handleClick}> {dev.state ? 'Aus' : 'Ein'} </button></li>; });
        return <ul> { deviceList } </ul>;
      }
    }
}

// class Toggle extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {isToggleOn: true};
//
//     // This binding is necessary to make `this` work in the callback
//     this.handleClick = this.handleClick.bind(this);
//   }
//
//   handleClick() {
//     this.setState(prevState => ({
//       isToggleOn: !prevState.isToggleOn
//     }));
//   }
//
//   render() {
//     return (
//       <button onClick={this.handleClick}>
//         {this.state.isToggleOn ? 'ON' : 'OFF'}
//       </button>
//     );
//   }
// }

ReactDOM.render(
  <Device />,
  document.getElementById('app')
)
