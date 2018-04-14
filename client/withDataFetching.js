import React, {Component} from 'react';
import RefreshIndicatorLoading from './RefreshIndicatorLoading';
import urlForWebSocket from './urlForWebSocket';

const withDataFetching = (WrappedComponent, toggle, objectsChanged) => {
  return class extends React.Component {
    constructor() {
      super();
      this.state = { data: [],  editIdx: -1, dataChanged: false };
      this.handleRowSelection = this.handleRowSelection.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.startEditing = this.startEditing.bind(this);
      this.stopEditing = this.stopEditing.bind(this);
    }

    componentDidMount() {
      this.webSock = new WebSocket(urlForWebSocket(''));
      this.webSock.onopen = () => {
        this.webSock.onmessage = e => {
          const message = JSON.parse(e.data);
          console.log(message);
          switch (message.type) {
            case 'readObjects': {
              this.setState({ data: message.value });
              break;
            }
            default:
              break;
          }
        };
        this.webSock.send(JSON.stringify({ type: 'readObjects'}));
      }
    }

    componentWillUnmount() {
      if (this.state.dataChanged) {
        this.webSock.send(JSON.stringify({ type: 'writeObjects', value: this.state.data }));
      }
      this.webSock.close();
    }

    handleRowSelection(selections) {
      console.log('handleRowSelection', selections)
      if (this.state.editIdx === -1) {
        this.setState(prevState => ({
          data: prevState.data.map(
            (row, i) => ( {...row, 'val': (selections.indexOf(row.id) !== -1) } )
          )
        }))
        this.setState({ dataChanged: true });
      }
    }

    handleCancel() {
      this.setState({ dataChanged: false });
      this.setState({ editIdx: -1 });
      console.log('handleCancel', this.state)
    }

    handleChange(e, name, id) {
      const { value } = e.target;
      this.setState(prevState => ({
        data: prevState.data.map(
          row => (row.id === id ? { ...row, [name]: value } : row)
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
        const header = [
          {
            name: "Object Name",
            prop: "name",
            key: "name",
            numeric: false,
            padding: false,
            label: this.props.texts.ObjectName
          },
          {
            name: "",
            prop: "edit",
            key: "edit",
            numeric: false,
            padding: false,
            label: this.props.texts.Edit
          }
        ];
      return (
        <WrappedComponent
          data={ this.state.data }
          selections={this.state.data.length > 0 ? this.state.data.filter(n => n.val === true).map(m => m.id) : []}
          header={header}
          toggle={toggle}
          handleRowSelection={this.handleRowSelection}
          handleCancel={this.handleCancel}
          objectsChanged={objectsChanged}
          handleChange={this.handleChange}
          stopEditing={this.stopEditing}
          editIdx={this.state.editIdx}
          startEditing={this.startEditing}
          texts={this.props.texts}
         />
       )
     } else { return (<RefreshIndicatorLoading />)}
    }
  }
}

export default withDataFetching;
