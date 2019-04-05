import React from 'react';
import styled from 'styled-components';


const Container = styled.div`
`;
const Button = styled.button`
  padding: 0;
  margin: 0;
  text-transform: uppercase;
  font-size: 20px;
  border: none;
  cursor: pointer;
  color: ${(props) => props.active ? props.theme.neutral[100] : props.theme.neutral[600]};
  background-color: inherit;
  font-weight: 400;
`;

const TableMapToggle = ({chartType, handleClick}) => {
  return (
    <Container>
      <Button active={chartType==="table"} onClick={() => handleClick("table")}>
        {"show tables"}
      </Button>
      <Button active={chartType==="map"} onClick={() => handleClick("map")}>
        {"show maps"}
      </Button>
    </Container>
  );
};

export default TableMapToggle;

