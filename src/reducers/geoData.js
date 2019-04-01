import * as types from "../actions/types";

const geoData = (state = null, action) => {
  switch (action.type) {
    case types.SET_GEO_DATA:
      return action.data;
    default:
      return state;
  }
};

export default geoData;
