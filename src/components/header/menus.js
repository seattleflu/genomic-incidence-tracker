import styled from 'styled-components';
import React from 'react';
import LogOut from "./logOut";

const Container = styled.div`
  color: ${(props) => props.theme.neutral[200]};
  font-size: 20px;
  text-transform: "uppercase";
`;

const Button = styled.button`
  font-family ${(props) => props.theme.mainFont};
  font-size ${(props) => props.theme.fontSmall};
  text-transform: uppercase;
  background-color: none;
  border: none;
`;

const Menus = () => {
  return (
    <Container>
      <Button>
        {"???"}
      </Button>
      <LogOut/>
    </Container>
  );
};


export default Menus;
