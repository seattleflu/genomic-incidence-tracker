import React, {useRef} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { selectDataForTable } from "../../reducers/privateData";
import { useD3ToRenderTable } from "./render";

export const tableDimensions = {
  minWidth: 700,
  maxWidth: 1000,
  minHeight: 550,
  maxHeight: 1000
};

const Container = styled.div`
  min-width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  min-height: ${(props) => props.height}px;
  max-height: ${(props) => props.height}px;
`;

const Table = (props) => {
  const refElement = useRef(null);
  useD3ToRenderTable({ref: refElement.current, width: props.width, height: props.height, data: props.data});
  return (
    <Container width={props.width} height={props.height}>
      <div ref={refElement}/>
    </Container>
  );
};

const mapStateToProps = (state, props) => {
  return {
    data: selectDataForTable(state, props)
  };
};

export default connect(mapStateToProps)(Table);
