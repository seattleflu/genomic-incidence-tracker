import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled, { withTheme } from 'styled-components';
import { makeSelectDataForChart } from "../../reducers/selectResults";
import { selectGeoResolution, isModelViewSelected, selectModellingDisplayVariable} from "../../reducers/settings";
import { selectGeoJsonData, selectGeoLinks } from "../../reducers/geoData";
import { renderMap } from "./render";
import HoverInfoBox, { useHover } from "../hover";

export const geoDimensions = {
  minWidth: 300,
  maxWidth: 600,
  minHeight: 600,
  maxHeight: 1200
};
const margin = 10;
const Container = styled.div`
  min-width: ${(props) => props.width - 2*margin}px;
  max-width: ${(props) => props.width - 2*margin}px;
  min-height: ${(props) => props.height - 2*margin}px;
  max-height: ${(props) => props.height - 2*margin}px;
  margin: ${margin}px;
  background-color: white;
  position: relative;
`;

const Geo = ({width, height, geoResolution, geoJsonData, geoLinks, resultsData, modelViewSelected, selectedModellingDisplayVariable, theme}) => {
  const refElement = useRef(null);
  const [hoverState, handleHoverOver, handleHoverOut] = useHover();

  useEffect(
    /* when deps change we want to rerender the map (it handles "how" it re-renders)
    without the deps array we rerender every time handleHoverOver is called (which changes hoverState)
    which is not desired. */
    () => renderMap({
      ref: refElement.current,
      width: width-2*margin,
      height: height-2*margin,
      resultsData,
      modelViewSelected,
      selectedModellingDisplayVariable,
      geoJsonData,
      geoResolution,
      geoLinks,
      handleHoverOver,
      handleHoverOut,
      theme: theme
    }),
    [width, height, resultsData, modelViewSelected, selectedModellingDisplayVariable, geoJsonData, geoResolution, geoLinks, handleHoverOver, handleHoverOut, theme]
  );

  return (
    <Container width={width} height={height}>
      <HoverInfoBox hoverState={hoverState} boundingBoxRef={refElement}/>
      <div ref={refElement}/>
    </Container>
  );
};


/* See comment in "../table/index.js" for why mapStateToProps is created this way */
const makeMapStateToProps = () => {
  const selectDataForChart = makeSelectDataForChart();
  const mapStateToProps = (state, props) => {
    return {
      geoResolution: selectGeoResolution(state),
      geoJsonData: selectGeoJsonData(state),
      geoLinks: selectGeoLinks(state),
      resultsData: selectDataForChart(state, props),
      modelViewSelected: isModelViewSelected(state),
      selectedModellingDisplayVariable: selectModellingDisplayVariable(state)
      // theme: props.theme
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(withTheme(Geo));
