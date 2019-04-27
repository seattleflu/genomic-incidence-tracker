import queryString from "query-string";
import * as types from "./types";
import { initialState } from "../reducers/settings";

/**
 * @throws
 */
export const checkObjectHas = (obj, props) => {
  for (const prop of props) {
    if (!obj.hasOwnProperty(prop)) {
      throw new Error(`Property ${prop} not set`);
    }
  }
};

/**
 * get the top level data e.g. `primaryVariable`, `pathogen`
 * check the shape for errors (somewhat incomplete)
 * and transform into the correct data format for the client to use
 * @throws
 */
const getTopLevelData = (jsonData, key, {typeNeeded=false} = {}) => {
  const data = {};
  checkObjectHas(jsonData, [key]);
  checkObjectHas(jsonData[key], ["sidebarLabel"]);
  data.sidebarLabel = jsonData[key].sidebarLabel;
  if (jsonData[key].choices) {
    if (!Array.isArray(jsonData[key].choices)) {
      throw new Error("Choices options must be an array");
    }
    for (const choice of jsonData[key].choices) {
      checkObjectHas(choice, ["value", "label"]);
      if (typeNeeded) {
        checkObjectHas(choice, ["type"]);
        if (choice.type === "continuous" && !Array.isArray(choice.bins)) {
          throw new Error("Bins must be set for continous type");
        }
      }
    }
    data.choices = jsonData[key].choices.map((choice) => Object.assign({}, choice));
  } else if (jsonData[key].useChoicesOf) {
    checkObjectHas(jsonData, [jsonData[key].useChoicesOf]);
    const ref = getTopLevelData(jsonData, jsonData[key].useChoicesOf, {typeNeeded});
    data.choices = ref.choices;
  } else {
    throw new Error(`Neither "choices" nor "useChoicesOf" set for ${key}`);
  }
  if (jsonData[key].unset) {
    data.selected = null;
    data.choices.unshift({value: "REMOVE", label: "REMOVE"});
  } else {
    data.selected = data.choices[0];
  }
  return data;
};

/**
 * Apply url queries present on page load which may change
 * the (selected) settings.
 * @sideEffect modifies `state` in place
 */
const applyUrlQueries = (state) => {
  const query = queryString.parse(window.location.search);
  if (query.screen) {
    state.screen = query.screen; // error-checking TODO
  }
};

/**
 * Parse the incoming data here. This is extremely useful if we ever
 * change the data format as we simply need to change this function.
 * @returns {Object} settings state object
 * @throws
 */
const parseData = (jsonData) => {
  const settingsState = Object.assign({}, initialState);
  settingsState.pathogen = getTopLevelData(jsonData, "pathogen");
  settingsState.geoResolution = getTopLevelData(jsonData, "geoResolution");
  settingsState.dataSource = getTopLevelData(jsonData, "dataSource");
  settingsState.time = getTopLevelData(jsonData, "time");
  settingsState.primaryVariable = getTopLevelData(jsonData, "primaryVariable", {typeNeeded: true});
  settingsState.groupByVariable = getTopLevelData(jsonData, "groupByVariable");
  settingsState.loaded = true;
  applyUrlQueries(settingsState);
  return settingsState;
};


const getAvailableVariables = () => async (dispatch) => {
  let data;
  try {
    data = await fetch('/getAvailableVariables')
      .then((res) => res.json())
      .then((res) => parseData(res));

  } catch (err) {
    console.error("Error fetching / parsing available variables");
    console.error(err);
  }
  try {
    dispatch({type: types.SET_AVAILIABLE_VARIABLES, data});
  } catch (err) {
    console.error("Error while dispatching from getAvailableVariables:");
    console.error(err);
  }
};

export default getAvailableVariables;
