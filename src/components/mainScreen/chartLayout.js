import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';

/* Container will hold all the individual tables and/or maps */
const Container = styled.div`
  position: relative;
  width: ${(props) => props.width+"px"};
  background-color: red;
`;

class ChartLayout extends React.Component {
  render() {
    return (
      <Container>
        <h2>graphs etc here</h2>
      </Container>
    );
  }
}

export default ChartLayout;
