import React from 'react';
// import styled from 'styled-components';
import { connect } from "react-redux";
import * as types from "../../actions/types";

const LogOut = ({logOut}) => {
  const handleClick = (event) => {
    event.preventDefault();
    logOut();
  };
  return (
    <button onClick={handleClick}>
      log out
    </button>
  );
};

const mapDispatchToProps = {
  logOut: () => ({type: types.AUTH_FAILED, message: "Successfully logged out"})
};
export default connect(null, mapDispatchToProps)(LogOut);
