import React from 'react';
import styled from 'styled-components';
import { getDemes } from "../../utils/processGeoData";


export const geoDimensions = {
  minWidth: 300,
  maxWidth: 600,
  minHeight: 600,
  maxHeight: 1200
};

const Placeholder = styled.div`
  background-color: #84A5C7;
  min-width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  min-height: ${(props) => props.height}px;
  max-height: ${(props) => props.height}px;
  font-size: 20px;
`;

const Geo = ({variable, geoResolution, geoData, width, height}) => {
  return (
    <Placeholder width={width} height={height}>
      <div>MAP OF SEATTLE</div>
      <div>{`resolution: ${geoResolution.label} (${getDemes({geoData, geoResolution}).length} demes)`}</div>
      <div>{`variable: ${variable.label}`}</div>
      <div>{`display method: TO DO`}</div>
    </Placeholder>
  );
};

export default Geo;
