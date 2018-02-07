import React, {Component} from 'react';

const withDataFetching = (WrappedComponent, url, toggle) => {
  return class extends React.Component {
    constructor() {
      super();
      this.state = { data: [] };
    }

    componentDidMount() {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          this.setState({ data });
        });
    }

    render() {
      return (
        <WrappedComponent
          data={ this.state.data }
          toggle={toggle}
         />
       )
    }
  }
}

export default withDataFetching;
