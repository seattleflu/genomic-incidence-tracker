import * as types from "../actions/types";


/* This reducer holds the variable choices & settings which are
 * rendered in the sidebar and control the visualisation
 *
 * Their shape is hardcoded here, but if the app grows to use
 * different shapes, these could be set by the fetched data
 */

const initialState = {
  loaded: false
};

const setAvailableData = (data) => {
  const state = data;
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
      return setAvailableData(action.data);
    case types.CHANGE_SETTING:
      const modification = {};
      modification[action.key] = Object.assign({}, state[action.key], {selected: action.value});
      return Object.assign({}, state, modification);
    default:
      return state;
  }
};

export default settings;
