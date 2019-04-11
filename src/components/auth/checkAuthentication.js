import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { isLoggedIn } from "../../reducers/misc";

/**
 * This component checks whether the user is logged in and renders
 * the appropriate child -- [0] if _not_ authenticated, [1] if authenticated
 */
const CheckAuthentication = ({loggedIn, logInComponent, children}) => {
  if (loggedIn) {
    return children;
  }
  return logInComponent;
};

CheckAuthentication.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  logInComponent: PropTypes.element.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]).isRequired
};

const mapStateToProps = (state) => {
  return {loggedIn: isLoggedIn(state)};
};

export default connect(mapStateToProps)(CheckAuthentication);

