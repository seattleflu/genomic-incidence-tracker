import * as types from "./types";
import { checkObjectHas } from "./getAvailableVariables";


const fetchJsonDataIfAuthorized = () => {
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
  return fetch('/getResults', fetchConfig)
    .then((res) => {
      if (res.status !== 200) throw new Error(res.statusText);
      return res;
    })
    .then((res) => res.json());
};

const checkDataForErrors = (jsonData) => {
  if (!Array.isArray(jsonData)) {
    throw new Error("results data is not an array");
  }
  for (const entry of jsonData) {
    checkObjectHas(entry, ["sex", "residence_census_tract", "age", "flu_shot", "pathogen"]);
  }
  return jsonData;
};

/**
 * The getResults fetch must include the JWT.
 * (this functionality should be abstracted, maybe middleware, if used often)
 * Note that the user _should_ be logged in to access this, but this should be tested
 */
const getResults = () => async (dispatch) => {
  let data;
  try {
    const jsonData = await fetchJsonDataIfAuthorized();
    data = checkDataForErrors(jsonData);
  } catch (err) {
    if (err.message === "Unauthorized") {
      dispatch({type: types.AUTH_FAILED, message: "Unauthorized / invalid JWT"});
      console.error("invalid JWT during API call. You have been logged out");
      return;
    }
    console.error("Error getting / parsing results data");
    console.error(err);
  }

  try {
    dispatch({type: types.SET_RESULTS, data});
  } catch (err) {
    console.error("Error dispatching SET_RESULTS");
    console.error(err);
    // to do -- fail more gracefully -- the viz is completely broken at this point
  }
};


export default getResults;
