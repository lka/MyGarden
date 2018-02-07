import React, {Component} from 'react';

const withDataFetching = (WrappedComponent, url, toggle) => {
  return class extends React.Component {
    constructor() {
      super();
      this.state = { data: [] };
      this.handleClick = this.handleClick.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidMount() {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          this.setState({ data });
        });
    }

    componentWillUnmount() {
      if (this.state.dataChanged) {
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.state.data)
        })
        .then(data => {
          console.log('Request succeeded with response', data);
        })
        .catch(error => {
          console.log('Request failed', error);
        })
      }
    }

    handleClick(num) {
      for (let i = 0; i < this.state.data.length; i++) {
          this.state.data[i].val = (num === 'all') || (num.indexOf(i) !== -1);
      }
      this.setState({ dataChanged: true });
    }

    handleCancel() {
      this.setState({ dataChanged: false })
    }

    render() {
      return (
        <WrappedComponent
          data={ this.state.data }
          toggle={toggle}
          handleClick={this.handleClick}
          handleCancel={this.handleCancel}
         />
       )
    }
  }
}

export default withDataFetching;
