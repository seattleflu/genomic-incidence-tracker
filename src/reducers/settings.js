import * as types from "../actions/types";

/* This reducer holds the variable choices & settings which are
 * rendered in the sidebar and control the visualisation,
 * as well as other settings.
 */

export const initialState = {
  loaded: false,
  screen: "main"
};

const settings = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_AVAILIABLE_VARIABLES:
      return Object.assign(state, action.data);
    case types.CHANGE_SETTING:
      const modification = {};
      if (action.value.value === "REMOVE") {
        modification[action.key] = Object.assign({}, state[action.key], {selected: null});
      } else {
        modification[action.key] = Object.assign({}, state[action.key], {selected: action.value});
      }
      return Object.assign({}, state, modification);
    case types.CHANGE_SCREEN:
      return Object.assign({}, state, {screen: action.data});
    default:
      return state;
  }
};

/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */

export const selectGeoResolution = (state) => {
  if (state.settings.geoResolution && state.settings.geoResolution.selected) {
    return state.settings.geoResolution.selected;
  }
  return false;
};

export const selectPathogen = (state) => {
  if (state.settings.pathogen && state.settings.pathogen.selected) {
    return state.settings.pathogen.selected;
  }
  return false;
};

export const isModelViewSelected = (state) => {
  if (state.settings.loaded) {
    return state.settings.dataSource.selected.value === "model";
  }
  return false;
};

export const selectTimeValue = (state) => state.settings.time.selected;

export const selectModellingDisplayVariable = (state) => state.settings.modellingDisplayVariable.selected;

export const selectSettingsForModelRequest = (state) => {
  const body = {
    geoResolution: state.settings.geoResolution.selected.value,
    pathogen: state.settings.pathogen.selected.value,
    outcome: "relative_incidence",
    model_type: "latent_field",
    model_version: "latest",
    epi_week: state.settings.time.selected.value
  };
  if (state.settings.groupByVariable.selected) {
    body.groupBy = state.settings.groupByVariable.selected.value;
  }
  return body;
};


export default settings;
