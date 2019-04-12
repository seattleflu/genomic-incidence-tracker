import * as types from "../actions/types";

const initialState = {
  authenticated: !!localStorage.getItem('user')
};

/**
 * The name of this reducer is pretty terrible -- I imagine
 * it will be refactored as the app grows
 */
const misc = (state = initialState, action) => {
  switch (action.type) {
    case types.AUTH_FAILED:
      localStorage.clear();
      return Object.assign({}, state, {loginFailedMessage: action.message, authenticated: false, username: undefined});
    case types.AUTH_SUCCESS:
      return Object.assign({}, state, {loginFailedMessage: undefined, authenticated: true, username: action.username});
    default:
      return state;
  }
};

/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */


export const getLoginMessage = (state) => {
  if (!state.misc.loginFailedMessage) return "";
  return state.misc.loginFailedMessage;
};

export const isLoggedIn = (state) => state.misc.authenticated;

export const getUsername = (state) => state.misc.username;

export default misc;
