function FunctionalComponent(props) {
  return <div>Hello, {props.name}</div>;
}

class Count extends React.Component {
  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.props.quantity !== nextProps.quantity;
  // }

  render() {
    return <p className="quantity">{formatAsBinary(this.props.quantity.value)}</p>
  }
}

function formatAsBinary(dec) {
  return dec.toString(2);
}

class ClassComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = { counter: { value: 0} };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState((prevState, props) => {
        const newCounter = {...prevState.counter};
        newCounter.value = newCounter.value + 1;
        return {counter: newCounter};
      })
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleClick() {
    this.setState ({ counter: { value: 0} });
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
