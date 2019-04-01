import queryString from "query-string";
import * as types from "../actions/types";
import {initialState as initialSettingsState} from "../reducers/settings";
/* What is this middleware?
 * It intercepts actions and, if necessary, modifies the URL query state
 * such that the URL reflects the app state, allowing sharing of links etc.
 */

const changeURLMiddleware = (store) => (next) => (action) => {
  // const state = store.getState(); // this is  state before the reducers have updated by this action
  const result = next(action); // immediately send unmodified action to other middleware / reducers

  const query = queryString.parse(window.location.search);
  switch (action.type) {
    case types.CHANGE_SCREEN:
      if (action.data !== initialSettingsState.screen) {
        query.screen = action.data;
      } else {
        delete query.screen;
      }
      break;
    default:
      break;
  }

  /* clean any empty query fields */
  Object.keys(query).filter((q) => query[q] === "").forEach((k) => delete query[k]);

  const search = queryString.stringify(query).replace(/%2C/g, ',').replace(/%2F/g, '/');
  const newURLString = `${window.location.pathname}${search ? `?${search}` : ""}`;
  window.history.replaceState({}, "", newURLString);
  return result;
};

export default changeURLMiddleware;