import React, {useState} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import Table, { tableDimensions } from "../table";
import Geo, { geoDimensions } from "../geo";
import { selectCategoriesForGroupByVariable } from "../../reducers/results";
import TableMapToggle from "./tableMapToggle";

/* Container will hold all the individual tables and/or maps */
const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
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

const getMapsToRender = (groupByCategories) => {
  /* calculate a list of all the maps to render... */
  if (groupByCategories) {
    return groupByCategories.map((groupByValue) => (
      <Geo
        key={`map_${groupByValue}`}
        width={geoDimensions.minWidth}
        height={geoDimensions.minHeight}
        groupByValue={groupByValue}
      />
    ));
  }
  return ([
    <Geo
      key={"mainMap"}
      width={geoDimensions.minWidth}
      height={geoDimensions.minHeight}
    />
  ]);
};

const ChartLayout = (props) => {
  /* this state only used if we are faceting, i.e. we have a group by variable */
  const [chartType, changeChartType] = useState("table");
  if (!props.geoData) {
    return null;
  }

  /* what to render? */
  const renderList = [];
  if (!props.groupByCategories || chartType === "table") {
    const tables = getTablesToRender(props.groupByCategories);
    tables.forEach((t) => renderList.push(t));
  }
  if (!props.groupByCategories || chartType === "map") {
    const maps = getMapsToRender(props.groupByCategories);
    maps.forEach((m) => renderList.push(m));
  }

  return (
    <>
      {props.groupByCategories ? <TableMapToggle chartType={chartType} handleClick={changeChartType}/> : null}
      <Container>
        {renderList}
      </Container>
    </>
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
