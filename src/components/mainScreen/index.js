import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from "react-redux";
import MainLayout from "./mainLayout";
import { getAvailableVariables } from "../../actions/fetchData";

/* This component manages the main screen (currently the only screen)
 * and is connected to redux.
 * It should not itself handle any layout decisions -- that is the remit
 * of the <Layout/> component.
 */


class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    /* fetch data for app ... */
    props.dispatch(getAvailableVariables());
  }

  render() {
    if (!this.props.loaded) {
      return (
        <h1>{"data not loaded..."}</h1>
      );
    }
    return (
      <MainLayout/>
    );
  }
}

// MainScreen.propTypes = {
//   name: PropTypes.string
// };

// MainScreen.defaultProps = {
//   name: 'Stranger'
// };

const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {loaded: state.settings.loaded};
};


export default connect(mapStateToProps)(MainScreen);
