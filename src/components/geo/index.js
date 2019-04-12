import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { makeSelectDataForChart } from "../../reducers/results";
import { selectGeoResolution } from "../../reducers/settings";
import { renderMap } from "./render";

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
`;

const Geo = ({width, height, data, geoResolution}) => {
  const refElement = useRef(null);

  useEffect(() =>
    renderMap({ref: refElement.current, width: width-2*margin, height: height-2*margin, data, geoResolution})
  );

  return (
    <Container width={width} height={height} ref={refElement}/>
  );
};


/* See comment in "../table/index.js" for why mapStateToProps is created this way */
const makeMapStateToProps = () => {
  const selectDataForChart = makeSelectDataForChart();
  const mapStateToProps = (state, props) => {
    return {
      geoResolution: selectGeoResolution(state),
      data: selectDataForChart(state, props)
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(Geo);
