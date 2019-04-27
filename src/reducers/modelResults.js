import * as types from "../actions/types";

const initialState = {
  ready: false,
  message: "Modelling results not (yet) available"
};

const modelResults = (state = initialState, action) => {
  switch (action.type) {
    case types.CLEAR_MODEL_DATA:
      return initialState;
    case types.SET_MODEL_DATA:
      return {ready: true, message: "", data: action.data};
    case types.ERROR_MODEL_DATA:
      return Object.assign({}, initialState, {message: action.message});
    default:
      return state;
  }
};

/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */

export const areModelResultsReady = (state) => state.modelResults.ready;

export const selectModelErrorMessage = (state) => state.modelResults.message;

export const selectModelResults = (modelData, demes, geoLinks, geoResolution, modellingDisplayVariable) => {
  const categories = ["incidence"];
  let maxValue = 0;
  const counts = modelData.map((d) => {
    const deme = geoLinks[d.residence_census_tract][geoResolution.value];
    const value = d[modellingDisplayVariable.value];
    if (value > maxValue) maxValue = value;
    return {key: deme, incidence: value};
  });

  return {
    categories,
    counts,
    demes,
    maxValue
  };
};

export default modelResults;
