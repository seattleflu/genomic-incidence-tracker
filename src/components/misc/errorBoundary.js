import React from "react";
import ShowError from "./showError";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.error(error);
    console.error(info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.showNothing) {
        return null;
      }
      return (<ShowError/>);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
