import React from 'react';
import ReactSelect from 'react-select';
import styled from 'styled-components';

const Title = styled.div`
  font-size: 16;
  font-family ${(props) => props.theme.mainFont};
  color: ${(props) => props.theme.colorSubheading};
  margin: 0px 0px 5px 0px;
`;

const Container = styled.div`
  padding: 0px 0px 20px 0px;
  font-family ${(props) => props.theme.mainFont};
`;

/* To-do: style the ReactSelect component using styled components
 * (this is simple with v2)
 * https://react-select.com/styles
 */

const Select = ({name, options, selected, handleChange}) => {
  return (
    <Container>
      <Title>
        {name}
      </Title>
      <ReactSelect
        value={selected}
        options={options}
        onChange={handleChange}
      />
    </Container>
  );
};

export default Select;
