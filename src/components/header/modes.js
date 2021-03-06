import styled from 'styled-components';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import * as types from '../../actions/types';
import Button from "../ui/button";

const Container = styled.div`
  color: ${(props) => props.theme.neutral[200]};
  font-size: 20px;
  padding-right: 20px;
`;

const Modes = ({changeScreen}) => {
  return (
    <Container>
      <Button onClick={() => changeScreen("main")}>
        {"Interact"}
      </Button>
      <Button onClick={() => changeScreen("report")}>
        {"Report"}
      </Button>
      <Button onClick={() => changeScreen("rawData")}>
        {"Raw Data"}
      </Button>
    </Container>
  );
};

Modes.propTypes = {
  changeScreen: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  changeScreen: (newScreen) => ({type: types.CHANGE_SCREEN, data: newScreen})
};
export default connect(null, mapDispatchToProps)(Modes);
