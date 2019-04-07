import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { selectDataForTable } from "../../reducers/results";
import { renderD3Table } from "./render";

export const tableDimensions = {
  minWidth: 570,
  maxWidth: 1000,
  minHeight: 450,
  maxHeight: 1000
};
const margin = 10;
const Container = styled.div`
  min-width: ${(props) => props.width - 2*margin}px;
  max-width: ${(props) => props.width - 2*margin}px;
  min-height: ${(props) => props.height - 2*margin}px;
  max-height: ${(props) => props.height - 2*margin}px;
  margin: ${margin}px;
`;

const Table = (props) => {
  const refElement = useRef(null);

  useEffect(() =>
    renderD3Table({ref: refElement.current, width: props.width-2*margin, height: props.height-2*margin, data: props.data})
  );

  return (
    <Container width={props.width} height={props.height} ref={refElement}/>
  );
};

const mapStateToProps = (state, props) => {
  return {
    data: selectDataForTable(state, props)
  };
};

export default connect(mapStateToProps)(Table);
