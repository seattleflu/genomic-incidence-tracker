import queryString from "query-string";
import * as types from "./types";
import { setDemesAndLinksFromRawData } from "../utils/processGeoData";

export const getAvailableVariables = () => async (dispatch) => {
  try {
    const data = await fetch('/getAvailableVariables')
      .then((res) => res.json());
    dispatch({type: types.SET_AVAILIABLE_VARIABLES, data, urlQuery: queryString.parse(window.location.search)});
  } catch (err) {
    /* Note that if the dispatch raises an error, e.g. in the reducer,
     * it will be caught here
     */
    console.error("Error in getAvailableVariables / reducer");
    console.error(err);
  }
};

export const getGeoJsons = () => async (dispatch) => {
  try {
    const data = await fetch('/getGeoJsons')
      .then((res) => res.json());
    /* we'll proabably want to transform the data into the correct form here (try to keep reducers minimal) */
    setDemesAndLinksFromRawData(data);
    dispatch({type: types.SET_GEO_DATA, data});
  } catch (err) {
    /* Note that if the dispatch raises an error, e.g. in the reducer,
     * it will be caught here
     */
    console.error("Error in getGeoJsons / reducer");
    console.error(err);
  }
};

/**
 * The getResults fetch must include the JWT.
 * (this functionality should be abstracted, maybe middleware, if used often)
 * Note that the user _should_ be logged in to access this, but this should be tested
 */
export const getResults = () => async (dispatch) => {
  try {
    const JWT = localStorage.getItem('user');
    if (!JWT) {
      throw new Error("No JWT (needed to fetch results)");
    }
    const fetchConfig = {
      method: 'GET',
      headers: {
        Authorization: JWT
      }
    };
    const data = await fetch('/getResults', fetchConfig)
      .then((res) => {
        if (res.status !== 200) throw new Error(res.statusText);
        return res;
      })
      .then((res) => res.json());

    /* we may want to transform the data into the correct form here (try to keep reducers minimal) */

    dispatch({type: types.SET_RESULTS, data});
  } catch (err) {
    /* Note that if the dispatch raises an error, e.g. in the reducer,
     * it will be caught here
     */
    if (err.message === "Unauthorized") {
      dispatch({type: types.AUTH_FAILED, message: "Unauthorized / invalid JWT"});
      console.error("invalid JWT during API call. You have been logged out");
      return;
    }
    console.error("Error in getResults / reducer");
    console.error(err);
    // to do -- fail more gracefully -- the viz is completely broken at this point
  }
};
