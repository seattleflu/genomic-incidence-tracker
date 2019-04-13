import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { makeSelectDataForChart } from "../../reducers/results";
import { selectGeoResolution } from "../../reducers/settings";
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

const Geo = ({width, height, geoResolution, geoJsonData, geoLinks, resultsData}) => {
  const refElement = useRef(null);
  const [hoverState, handleHoverOver, handleHoverOut] = useHover();

  useEffect(
    () => renderMap({ref: refElement.current, width: width-2*margin, height: height-2*margin, resultsData, geoJsonData, geoResolution, geoLinks, handleHoverOver, handleHoverOut}),
    // We purposfully ignore the hoverHandlers so that the effect will not get into a loop of recreating the viz, firing the hover, ...
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height, resultsData, geoJsonData, geoResolution, geoLinks]
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
      resultsData: selectDataForChart(state, props)
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(Geo);
