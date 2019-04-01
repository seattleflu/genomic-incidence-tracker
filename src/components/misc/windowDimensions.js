import React from "react";

/* https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs */

const windowDimensionsHOC = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { width: window.innerWidth, height: window.innerHeight };
      this.updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
      };
    }
    componentDidMount() {
      window.addEventListener("resize", this.updateWindowDimensions);
    }
    componentWillUnmount() {
      window.removeEventListener("resize", this.updateWindowDimensions);
    }
    render() {
      return (
        <WrappedComponent
          {...this.props}
          windowWidth={this.state.width}
          windowHeight={this.state.height}
        />
      );
    }
  };
};

export default windowDimensionsHOC;

