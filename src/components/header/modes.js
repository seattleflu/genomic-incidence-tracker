import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  color: ${(props) => props.theme.neutral[200]};
  font-size: 20px;
  padding-right: 20px
`;

const Button = styled.button`

`;


const Modes = () => {
  return (
    <Container>
      <Button>
        {"Interact"}
      </Button>
      <Button>
        {"Report"}
      </Button>
      <Button>
        {"Raw Data"}
      </Button>
    </Container>
  );
};


export default Modes;
