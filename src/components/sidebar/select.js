import React from 'react';
import ReactSelect from 'react-select';
import styled from 'styled-components';

const Title = styled.div`
  font-family ${(props) => props.theme.mainFont};
  font-size: 16;
  color: ${(props) => props.theme.colorSubheading};
  margin: 0px 0px 5px 0px;
`;

const Container = styled.div`
  font-family ${(props) => props.theme.mainFont};
  padding: 0px 0px 20px 0px;
`;

/* To-do: define how we want to style the select  */

const customReactSelectStyles = {
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'none'
  })
};

const Select = ({name, options, selected, handleChange}) => {
  return (
    <Container>
      <Title>
        {name}
      </Title>
      <ReactSelect
        styles={customReactSelectStyles}
        value={selected}
        options={options}
        onChange={handleChange}
      />
    </Container>
  );
};

export default Select;
