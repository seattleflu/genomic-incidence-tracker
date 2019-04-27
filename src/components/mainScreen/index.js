import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import styled from 'styled-components';
import windowDimensionsHOC from "../misc/windowDimensions";
import Sidebar from "../sidebar";
import ChartLayout from "./chartLayout";
import {headerHeight} from "../header";
import Options from "../sidebar/mainOptions";
import ShowError from "../misc/showError";
import { areModelResultsReady, selectModelErrorMessage } from "../../reducers/modelResults";
import { isModelViewSelected } from "../../reducers/settings";

/* MainContainer is all of the screen to the right of the sidebar */
export const MainContainer = styled.div`
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
      <ShowError message={"Data not loaded..."}/>
    );
  }

  const sidebarWidth = getSidebarWidth();
  const mainWidth = props.windowWidth - sidebarWidth;

  return (
    <>
      <Sidebar width={sidebarWidth} height={props.windowHeight}>
        <Options/>
      </Sidebar>
      <MainContainer width={mainWidth} height={props.windowHeight}>
        <Padding>
          {
            (props.displayModelResults && !props.areModelResultsReady) ?
              <ShowError message={props.modelErrorMessage}/> :
              <ChartLayout width={mainWidth}/>
          }
        </Padding>
      </MainContainer>
    </>
  );
};

MainScreen.propTypes = {
  loaded: PropTypes.bool.isRequired,
  windowWidth: PropTypes.number.isRequired,
  windowHeight: PropTypes.number.isRequired
};

const mapStateToProps = (state) => ({
  loaded: state.settings.loaded, // TODO
  displayModelResults: isModelViewSelected(state),
  areModelResultsReady: areModelResultsReady(state),
  modelErrorMessage: selectModelErrorMessage(state)
});

export default connect(mapStateToProps)(windowDimensionsHOC(MainScreen));

