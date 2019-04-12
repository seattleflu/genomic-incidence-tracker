import * as types from "../actions/types";

const geoDataReducer = (state = null, action) => {
  switch (action.type) {
    case types.SET_GEO_DATA:
      return action.data;
    default:
      return state;
  }
};

/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */

export const selectDemes = (state) => {
  /* this will replace the getDemes function */
  /* should be turned into a memoised selector if it becomes more complex */
  if (!state.settings.geoResolution) return false;
  return state.geoData[state.settings.geoResolution.selected.value].demes;
};

export const selectGeoLinks = (state) => {
  if (!state.geoData) return false;
  return state.geoData.links;
};

export default geoDataReducer;
