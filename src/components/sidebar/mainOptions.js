// import styled from 'styled-components';
import React from 'react';
import { connect } from "react-redux";
import Select from "./select";
import * as types from "../../actions/types";
import { isModelViewSelected } from "../../reducers/settings";


/* TO DO: let data choose layout */

const Options = ({settings, dispatch}) => {

  const settingsToRender = isModelViewSelected({settings}) ?
    ["pathogen", "geoResolution", "dataSource", "time", "modellingDisplayVariable"] :
    ["pathogen", "geoResolution", "dataSource", "primaryVariable", "groupByVariable"];


  return settingsToRender.map((key) => (
    <Select
      key={key}
      name={settings[key].sidebarLabel}
      options={settings[key].choices}
      selected={settings[key].selected}
      handleChange={(selection) => dispatch({type: types.CHANGE_SETTING, key, value: selection})}
    />
  ));
};

const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {settings: state.settings};
};

export default connect(mapStateToProps)(Options);
