import * as types from "../actions/types";
import { selectGeoResolution } from "./settings";

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
  const geoResolution = selectGeoResolution(state);
  if (!geoResolution) return false;
  return state.geoData[geoResolution.value].demes;
};

export const selectGeoLinks = (state) => {
  if (!state.geoData) return false;
  return state.geoData.links;
};

/* select the data in GeoJSON format for the current geographic
 * resolution
 */
export const selectGeoJsonData = (state) => {
  const geoResolution = selectGeoResolution(state);
  if (!geoResolution) return false;
  return state.geoData[geoResolution.value];
};

export default geoDataReducer;
