import React from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import Table, { tableDimensions } from "../table";
import Geo, { geoDimensions } from "../geo";

/* Container will hold all the individual tables and/or maps */
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: ${(props) => props.width+"px"};
  background-color: ${(props) => props.theme.mainBackground};
`;

const getTablesToRender = (settings) => {
  /* calculate a list of all the tables to render... */
  return ([
    <Table
      key={"mainTable"}
      width={tableDimensions.minWidth}
      height={tableDimensions.minHeight}
      variable={settings.primaryVariable.selected}
      geoResolution={settings.geoResolution.selected}
    />
  ]);
};

const getMapsToRender = (settings) => {
  /* calculate a list of all the maps to render... */
  return ([
    <Geo
      key={"mainMap"}
      width={geoDimensions.minWidth}
      height={geoDimensions.minHeight}
      variable={settings.primaryVariable.selected}
      geoResolution={settings.geoResolution.selected}
    />
  ]);
};


const ChartLayout = (props) => {
  const tables = getTablesToRender(props.settings);
  const maps = getMapsToRender(props.settings);
  const renderList = [];
  tables.forEach((t) => renderList.push(t));
  maps.forEach((m) => renderList.push(m));

  return (
    <Container>
      {renderList}
    </Container>
  );
};


const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {settings: state.settings};
};

export default connect(mapStateToProps)(ChartLayout);
