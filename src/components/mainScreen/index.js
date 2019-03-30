import React from 'react';
// import PropTypes from 'prop-types';
import Layout from "./layout";

/* This component manages the main screen (currently the only screen)
 * and is connected to redux.
 * It should not itself handle any layout decisions -- that is the remit
 * of the <Layout/> component.
 */


class MainScreen extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Layout/>
    )
  }
}

// MainScreen.propTypes = {
//   name: PropTypes.string
// };

// MainScreen.defaultProps = {
//   name: 'Stranger'
// };

export default MainScreen;
