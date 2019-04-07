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

export const getResults = () => async (dispatch) => {
  try {
    const data = await fetch('/getResults')
      .then((res) => res.json());
    /* we'll proabably want to transform the data into the correct form here (try to keep reducers minimal) */
    dispatch({type: types.SET_RESULTS, data});
  } catch (err) {
    /* Note that if the dispatch raises an error, e.g. in the reducer,
     * it will be caught here
     */
    console.error("Error in getResults / reducer");
    console.error(err);
  }
};
