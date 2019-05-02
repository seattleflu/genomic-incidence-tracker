import React from 'react';
import { connect } from "react-redux";
import * as types from "../../actions/types";
import Button from "../ui/button";

const LogOut = ({logOut}) => {
  const handleClick = (event) => {
    event.preventDefault();
    logOut();
  };
  return (
    <Button onClick={handleClick}>
      log out
    </Button>
  );
};

const mapDispatchToProps = {
  logOut: () => ({type: types.AUTH_FAILED, message: "Successfully logged out"})
};
export default connect(null, mapDispatchToProps)(LogOut);
