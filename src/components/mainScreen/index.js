import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import styled, { ThemeProvider } from 'styled-components';
import windowDimensionsHOC from "../misc/windowDimensions";
import Sidebar from "../sidebar";
import ChartLayout from "./chartLayout";
import { mainTheme } from "../../styles";
import Header, {headerHeight} from "../header";
import ErrorBoundary from "../misc/errorBoundary";

/* MainContainer is all of the screen to the right of the sidebar */
const MainContainer = styled.div`
  position: absolute;
  top: ${headerHeight}px;
  bottom: 0;
  right: 0;
  background-color: #fff;
  height: ${(props) => (props.height-headerHeight)+"px"};
  width: ${(props) => props.width+"px"};
  overflow-x: hidden;
  overflow-y: scroll;
  left: ${(props) => props.left+"px"};
  background-color: ${(props) => props.theme.mainBackground};
`;

const Padding = styled.div`
  padding: 20px 20px 20px 20px;
`;

const getSidebarWidth = (windowWidth) =>
  windowWidth > 1200 ? 300 : 250;

/* This component manages the main screen (currently the only screen)
 * It should handle all the layout decisions, but not much else.
 * It is wrapped by two HOCs which inject props relating to window resizes
 * and redux state
 */

const MainScreen = (props) => {
  if (!props.loaded) {
    return (
      <h1>{"data not loaded..."}</h1>
    );
  }

  const sidebarWidth = getSidebarWidth();
  const mainWidth = props.windowWidth - sidebarWidth;
  return (
    <ErrorBoundary>
      <ThemeProvider theme={mainTheme}>
        <>
          <Header/>
          <Sidebar width={sidebarWidth} height={props.windowHeight}/>
          <MainContainer width={mainWidth} height={props.windowHeight}>
            <Padding>
              <h2>title of current viz</h2>
              <ChartLayout width={mainWidth}/>
              <h2>footer</h2>
            </Padding>
          </MainContainer>
        </>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

MainScreen.propTypes = {
  loaded: PropTypes.bool.isRequired,
  windowWidth: PropTypes.number.isRequired,
  windowHeight: PropTypes.number.isRequired
};

// MainScreen.defaultProps = {
//   name: 'Stranger'
// };

const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {loaded: state.settings.loaded};
};

export default connect(mapStateToProps)(windowDimensionsHOC(MainScreen));

