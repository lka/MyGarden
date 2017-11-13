function FunctionalComponent(props) {
  return <div>Hello, {props.name}</div>;
}

function formatAsBinary(dec) {
  return dec.toString(2);
}

class Count extends React.Component {
  render() {
    return <p className="quantity">{formatAsBinary(this.props.quantity)}</p>
  }
}

class ClassComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = { counter: 0 };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState((prevState, props) => ({counter: prevState.counter + 1}))
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleClick() {

  }

  render() {
    console.log('render(...)', this.state);
    return (
      <div>
        <h1>Counter</h1>
        <Count quantity={this.state.counter} />
        <button onClick={this.handleClick}>Reset</button>
      </div>
    );
  }
}

ReactDOM.render(
  <ClassComponent name="René" />,
  document.getElementById('app')
);
