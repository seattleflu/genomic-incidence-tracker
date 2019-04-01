import styled from 'styled-components';
import React from 'react';
import Title from "./title";
import Modes from "./modes";
import Menus from "./menus";

/* This header is designed to always be present, even if one scrolls the "main section" */

export const headerHeight = 40;

const OuterContainer = styled.div`
  position: fixed;
  height: ${headerHeight}px;
  width: 100%;
  top: 0;
  left: 0;
  overflow-y: hidden;
  overflow-x: hidden;
  background-color: ${(props) => props.theme.sidebarBackground};
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-content: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  height: 100%;
  order: 0;
  padding: 3px 20px 3px 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Header = ({width, height}) => (
  <OuterContainer width={width} height={height}>
    <InnerContainer>
      <Title/>
      <Spacer/>
      <Modes/>
      <Menus/>
    </InnerContainer>
  </OuterContainer>
);

export default Header;
