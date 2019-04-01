// import styled from 'styled-components';
import React from 'react';
import { connect } from "react-redux";
import Select from "./select";
import * as types from "../../actions/types";


/* TO DO: let data choose layout */

const Options = ({settings, dispatch}) => {

  const settingsToRender = ["pathogen", "geoResolution", "dataSource", "time", "primaryVariable", "groupByVariable"]
    .filter((key) => key in settings);

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
