// import React, { Component } from 'react';
// import Device from './device.js';

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
  }

  componentDidMount() {
    fetch(urlForDevicesFromStorage(devices))
       .then(d => d.json())
       .then(d => {
         this.setState({
           isLoaded: true,
           device: d
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
        return (
          <ul>
            {device.map(device => (
              <li key={device.name}>
                {device.name}
              </li>
            ))}
        );
      }
    }
}

// function FunctionalComponent (props) {
//   return <div>Hello, {props.name}</div>;
// }
//

// class Count extends React.Component {
//   // shouldComponentUpdate(nextProps, nextState) {
//   //   return this.props.quantity !== nextProps.quantity;
//   // }
//
//   render () {
//     return (<p className="quantity">{formatAsBinary(this.props.quantity.value)}</p>)
//   }
// }
//
// function formatAsBinary(dec) {
//   return dec.toString(2);
// }

class ClassComponent extends React.Component {

  // constructor(props) {
  //   super(props);
  //
  //   this.state = { counter: { value: 0} };
  //
  //   // this.handleClick = this.handleClick.bind(this);
  // }

  // componentDidMount () {
  //   this.intervalId = setInterval(() => {
  //     this.setState((prevState, props) => {
  //       const newCounter = { ...prevState.counter };
  //
  //       newCounter.value = newCounter.value + 1;
  //       return {counter: newCounter};
  //     })
  //   }, 1000);
  // }

  // componentWillUnmount() {
  //   clearInterval(this.intervalId);
  // }
  //
  // handleClick() {
  //   this.setState ({ counter: { value: 0} });
  // }

  render() {
    console.log('render(...)', this.state);
    return (
      <div>
        // <h1>Counter</h1>
        // <Count quantity={this.state.counter} />
        // <button onClick={this.handleClick}>Reset</button>
        <Device device="devices"></Device>
      </div>
    );
  }
}

ReactDOM.render(
  <ClassComponent name="René" />,
  document.getElementById('app')
);
