// import React, { Component } from 'react';

const urlForDevicesFromStorage = device =>
  `http://localhost:3000/${device}`

class Device extends Component {

  // componentDidMount() {
  //   fetch(urlForDevicesFromStorage(this.props.device))
  //     .then(d => d.json())
  //     .then(d => {
  //       this.setState({
  //         device: d
  //       })
  //     })
  //   }

    render() {
      return (
        <div>
          <p>Loading...</p>
          // <h2>{this.state.device.name}</h2>
        </div>
      )
    }
}

export default Device;
