import styled from 'styled-components';
import React from 'react';

const Container = styled.div`
  color: ${(props) => props.theme.neutral[600]};
  font-size: 20px;
  text-transform: uppercase;
`;


const Title = () => {
  return (
    <Container>
      {"genomic incidence mapper - prototype"}
    </Container>
  );
};


export default Title;
