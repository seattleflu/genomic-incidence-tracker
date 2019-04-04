import { combineReducers } from "redux";
import settings from "./settings";
import geoData from "./geoData";
import privateData from "./privateData";

const rootReducer = combineReducers({
  settings,
  geoData,
  privateData
});

export default rootReducer;
