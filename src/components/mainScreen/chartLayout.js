import React from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import Table, { tableDimensions } from "../table";
import Geo, { geoDimensions } from "../geo";
import { selectCategoriesForGroupByVariable } from "../../reducers/privateData";

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

const getTablesToRender = (groupByCategories) => {
  /* calculate a list of all the tables to render... */
  if (groupByCategories) {
    return groupByCategories.map((groupByValue) => (
      <Table
        key={`table_${groupByValue}`}
        width={tableDimensions.minWidth}
        height={tableDimensions.minHeight}
        groupByValue={groupByValue}
      />
    ));
  }
  return ([
    <Table
      key={"mainTable"}
      width={tableDimensions.minWidth}
      height={tableDimensions.minHeight}
    />
  ]);
};

const getMapsToRender = ({settings, geoData}) => {
  /* calculate a list of all the maps to render... */
  return ([
    <Geo
      key={"mainMap"}
      width={geoDimensions.minWidth}
      height={geoDimensions.minHeight}
      variable={settings.primaryVariable.selected}
      geoResolution={settings.geoResolution.selected}
      geoData={geoData}
    />
  ]);
};


const ChartLayout = (props) => {
  if (!props.geoData) {
    return null;
  }

  const tables = getTablesToRender(props.groupByCategories);
  const maps = getMapsToRender({...props});
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
  return {
    groupByCategories: selectCategoriesForGroupByVariable(state),
    settings: state.settings,
    geoData: state.geoData /* will be injected to the map / table instead */
  };
};

export default connect(mapStateToProps)(ChartLayout);
