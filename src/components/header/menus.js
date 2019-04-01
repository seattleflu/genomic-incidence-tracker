import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  color: ${(props) => props.theme.neutral[200]};
  font-size: 20px;
  text-transform: "uppercase";
`;

const Button = styled.button`

`;

const Menus = () => {
  return (
    <Container>
      <Button>
        {"X"}
      </Button>
      <Button>
        {"X"}
      </Button>
      <Button>
        {"X"}
      </Button>
    </Container>
  );
};


export default Menus;
