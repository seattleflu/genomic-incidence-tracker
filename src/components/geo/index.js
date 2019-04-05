import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { selectDataForTable } from "../../reducers/privateData";
import { selectGeoResolution } from "../../reducers/settings";
import { renderMap } from "./render";

export const geoDimensions = {
  minWidth: 300,
  maxWidth: 600,
  minHeight: 600,
  maxHeight: 1200
};

const Container = styled.div`
  background-color: #84A5C7;
  min-width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  min-height: ${(props) => props.height}px;
  max-height: ${(props) => props.height}px;
  font-size: 20px;
`;

const Geo = ({width, height, data, geoResolution}) => {
  const refElement = useRef(null);

  useEffect(() =>
    renderMap({ref: refElement.current, width, height, data, geoResolution})
  );

  return (
    <Container width={width} height={height}>
      <div ref={refElement}/>
    </Container>
  );
};


const mapStateToProps = (state, props) => {
  return {
    geoResolution: selectGeoResolution(state),
    data: selectDataForTable(state, props)
  };
};

export default connect(mapStateToProps)(Geo);
