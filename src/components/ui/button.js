import styled from 'styled-components';

const Button = styled.button`
  font-family ${(props) => props.theme.mainFont};
  font-size ${(props) => props.theme.fontSmall};
  text-transform: uppercase;
  background-color: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.blue}
  }
`;

export default Button;
