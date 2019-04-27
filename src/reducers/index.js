import { combineReducers } from "redux";
import settings from "./settings";
import geoData from "./geoData";
import results from "./results";
import misc from "./misc";
import modelResults from "./modelResults";

const rootReducer = combineReducers({
  settings,
  geoData,
  modelResults,
  results,
  misc
});

export default rootReducer;
