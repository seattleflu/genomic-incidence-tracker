import { combineReducers } from "redux";
import settings from "./settings";
import geoData from "./geoData";

const rootReducer = combineReducers({
  settings,
  geoData
});

export default rootReducer;
