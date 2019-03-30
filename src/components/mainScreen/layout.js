import React from 'react';
// import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';
import windowDimensionsHOC from "../windowDimensions";
import Sidebar from "../sidebar";
import ChartLayout from "./chartLayout";
import { mainTheme } from "../../styles";

/* MainContainer is all of the screen to the right of the sidebar */
const MainContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: #fff;
  height: ${(props) => props.height+"px"};
  width: ${(props) => props.width+"px"};
  overflow-x: hidden;
  overflow-y: scroll;
  left: ${(props) => props.left+"px"};
  background-color: yellowgreen;
`;

const getSidebarWidth = (windowWidth) =>
  windowWidth > 1200 ? 300 : 250;

const Layout = (props) => {
  const sidebarWidth = getSidebarWidth();
  const mainWidth = props.windowWidth - sidebarWidth;
  return (
    <ThemeProvider theme={mainTheme}>
      <>
        <Sidebar width={sidebarWidth} height={props.windowHeight}/>
        <MainContainer width={mainWidth} height={props.windowHeight}>
          <h1>THIS IS THE HEADER</h1>
          <ChartLayout width={mainWidth}/>
          <h1>THIS IS THE FOOTER</h1>
        </MainContainer>
      </>
    </ThemeProvider>
  );
};

export default windowDimensionsHOC(Layout);
