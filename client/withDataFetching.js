import React, {PureComponent} from 'react';
import RefreshIndicatorLoading from './RefreshIndicatorLoading';

const withDataFetching = (WrappedComponent, url, toggle, objectsChanged) => {
  return class extends React.PureComponent {
    constructor() {
      super();
      this.state = { data: [],  editIdx: -1 };
      this.handleRowSelection = this.handleRowSelection.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.startEditing = this.startEditing.bind(this);
      this.stopEditing = this.stopEditing.bind(this);
    }

    componentDidMount() {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          this.setState({ data });
        })
        .catch(error => {
          console.log('GET Request failed', error);
        })
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
          console.log('POST Request succeeded with response', data);
          objectsChanged();
        })
        .catch(error => {
          console.log('POST Request failed', error);
        })
      }
    }

    handleRowSelection(num) {
      if (this.state.editIdx === -1) {
        this.setState(prevState => ({
          data: prevState.data.map(
            (row, i) => ( {...row, 'val': (num.indexOf(row.id) !== -1) } )
          )
        }))
        this.setState({ dataChanged: true });
      }
    }

    handleCancel() {
      this.setState({ dataChanged: false })
      this.setState({ editIdx: -1 });
    }

    handleChange(e, name, i) {
      const { value } = e.target;
      this.setState(prevState => ({
        data: prevState.data.map(
          (row, j) => (j === i ? { ...row, [name]: value } : row)
        )
      }));
      this.setState({ dataChanged: true });
    }

    startEditing(i) {
      this.setState({ editIdx: i });
    }

    stopEditing() {
      this.setState({ editIdx: -1 });
    }

    render() {
      if (this.state.data.length > 0) {
      return (
        <WrappedComponent
          data={ this.state.data }
          selections={this.state.data.length > 0 ? this.state.data.filter(n => n.val === true).map(m => m.id) : []}
          header={[
            {
              name: "Object Name",
              prop: "name",
              key: "name",
              numeric: false,
              padding: false,
              label: "Object Name"
            },
            {
              name: "",
              prop: "edit",
              key: "edit",
              numeric: false,
              padding: false,
              label: "Edit"
            }
          ]}
          toggle={toggle}
          handleRowSelection={this.handleRowSelection}
          handleCancel={this.handleCancel}
          objectsChanged={objectsChanged}
          handleChange={this.handleChange}
          stopEditing={this.stopEditing}
          editIdx={this.state.editIdx}
          startEditing={this.startEditing}
         />
       )
     } else { return (<RefreshIndicatorLoading />)}
    }
  }
}

export default withDataFetching;
