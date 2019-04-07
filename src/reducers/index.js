import { combineReducers } from "redux";
import settings from "./settings";
import geoData from "./geoData";
import results from "./results";

const rootReducer = combineReducers({
  settings,
  geoData,
  results
});

export default rootReducer;
