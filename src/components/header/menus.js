import styled from 'styled-components';
import React from 'react';
import LogOut from "./logOut";
import Button from "../ui/button";

const Container = styled.div`
  color: ${(props) => props.theme.neutral[200]};
  font-size: 20px;
  text-transform: "uppercase";
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
