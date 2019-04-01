import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import windowDimensionsHOC from "../misc/windowDimensions";
import Sidebar from "../sidebar";
import { MainContainer } from "../mainScreen";

const SidebarContent = styled.div`
  font-size: 14px;
`;

const InnerContainer = styled.div`
  padding: 20px 20px 20px 20px;
`;

const getSidebarWidth = (windowWidth) =>
  windowWidth > 1200 ? 300 : 250;

const ReportScreen = (props) => {
  const sidebarWidth = getSidebarWidth();
  const mainWidth = props.windowWidth - sidebarWidth;
  return (
    <>
      <Sidebar width={sidebarWidth} height={props.windowHeight}>
        <SidebarContent>
          {"sidebar content"}
        </SidebarContent>
      </Sidebar>
      <MainContainer width={mainWidth} height={props.windowHeight}>
        <InnerContainer>
          {"Report content here"}
        </InnerContainer>
      </MainContainer>
    </>
  );
};

ReportScreen.propTypes = {
  windowWidth: PropTypes.number.isRequired,
  windowHeight: PropTypes.number.isRequired
};

export default windowDimensionsHOC(ReportScreen);

