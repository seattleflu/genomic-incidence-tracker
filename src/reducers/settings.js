import * as types from "../actions/types";


/* This reducer holds the variable choices & settings which are
 * rendered in the sidebar and control the visualisation,
 * as well as other settings.
 *
 * Their shape is hardcoded here, but if the app grows to use
 * different shapes, these could be set by the fetched data
 */

export const initialState = {
  loaded: false,
  screen: "main"
};

const setAvailableData = (existingState, data, urlQuery) => {
  const state = Object.assign({}, existingState, data);

  for (const key of Object.keys(data)) {
    if (state[key].useChoicesOf) {
      const choicesToCopy = state[state[key].useChoicesOf].choices;
      state[key].choices = choicesToCopy.map((choice) => Object.assign({}, choice));
      delete state[key].useChoicesOf;
    }

    if (state[key].unset) {
      state[key].selected = null;
      state[key].choices.unshift({value: "REMOVE", label: "REMOVE"});
      delete state[key].unset;
    } else {
      state[key].selected = data[key].choices[0];
    }
    // if (urlQuery[key] && data[key].choices.map((c) => c.value).includes(urlQuery[key])) {
    //   state[key].selected = data[key].choices[data[key].choices.map((c) => c.value).indexOf(urlQuery[key])];
    // }
  }
  state.loaded = true;
  /* perhaps there's a better place to check other parts of the URL state
  but this fn runs when the initial data is set */
  if (urlQuery.screen) {
    state.screen = urlQuery.screen; // error-checking!
  }

  return state;
};

const settings = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_AVAILIABLE_VARIABLES:
      return setAvailableData(state, action.data, action.urlQuery);
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

export const selectGeoResolution = (state) => {
  if (state.settings.geoResolution && state.settings.geoResolution.selected) {
    return state.settings.geoResolution.selected;
  }
  return false;
};

export default settings;
