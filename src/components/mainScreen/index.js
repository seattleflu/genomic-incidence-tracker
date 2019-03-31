import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from "react-redux";
import Layout from "./layout";
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
    return (
      <Layout/>
    );
  }
}

// MainScreen.propTypes = {
//   name: PropTypes.string
// };

// MainScreen.defaultProps = {
//   name: 'Stranger'
// };


export default connect(null, null)(MainScreen);
