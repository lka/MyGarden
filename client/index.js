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
  }

  componentDidMount() {
    fetch(urlForDevicesFromStorage('devices'))
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
          </ul>
        );
      }
    }
}

ReactDOM.render(
  <Device />,
  document.getElementById('app')
)
