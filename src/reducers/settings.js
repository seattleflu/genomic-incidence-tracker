import * as types from "../actions/types";


/* This reducer holds the variable choices & settings which are
 * rendered in the sidebar and control the visualisation,
 * as well as other settings.
 *
 * Their shape is hardcoded here, but if the app grows to use
 * different shapes, these could be set by the fetched data
 */

const initialState = {
  loaded: false,
  screen: "main"
};

const setAvailableData = (existingState, data) => {
  const state = Object.assign({}, existingState, data);
  for (const key of Object.keys(data)) {
    if (state[key].unset) {
      state[key].selected = null;
      delete state[key].unset;
    } else {
      state[key].selected = data[key].choices[0];
    }
  }
  state.loaded = true;
  return state;
};

const settings = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_AVAILIABLE_VARIABLES:
      return setAvailableData(state, action.data);
    case types.CHANGE_SETTING:
      const modification = {};
      modification[action.key] = Object.assign({}, state[action.key], {selected: action.value});
      return Object.assign({}, state, modification);
    case types.CHANGE_SCREEN:
      return Object.assign({}, state, {screen: action.data});
    default:
      return state;
  }
};

export default settings;
