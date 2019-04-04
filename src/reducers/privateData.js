import * as types from "../actions/types";


/**
 * The name of this reducer will change as we better understand what data
 * can be shared with the client.
 */
const privateData = (state = null, action) => {
  switch (action.type) {
    case types.SET_PRIVATE_DATA:
      return action.data;
    default:
      return state;
  }
};

export default privateData;
