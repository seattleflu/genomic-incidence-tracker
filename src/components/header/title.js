import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  color: ${(props) => props.theme.neutral[800]};
  font-family ${(props) => props.theme.mainFont};
  font-size: 20px;
  text-transform: capitalize;
`;


const Title = () => {
  return (
    <Container>
      {"genomic incidence mapper - prototype"}
    </Container>
  );
};


export default Title;
