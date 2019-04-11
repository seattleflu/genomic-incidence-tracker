import { combineReducers } from "redux";
import settings from "./settings";
import geoData from "./geoData";
import results from "./results";
import misc from "./misc";

const rootReducer = combineReducers({
  settings,
  geoData,
  results,
  misc
});

export default rootReducer;
