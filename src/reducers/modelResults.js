import { extent, group, rollup } from "d3-array";
import { DateTime } from "luxon";
import * as types from "../actions/types";

const initialState = {
  ready: false,
  message: "Modelling results not (yet) available"
};

const modelResults = (state = initialState, action) => {
  switch (action.type) {
    case types.CLEAR_MODEL_DATA:
      return initialState;
    case types.SET_MODEL_DATA:
      return {ready: true, message: "", data: action.data};
    case types.ERROR_MODEL_DATA:
      return Object.assign({}, initialState, {message: action.message});
    default:
      return state;
  }
};

// **** "new" functions required to create a heat map

/**
 * @returns {function} returns the an array of unique weeks present in the payload in
 * week ISO 8601 format (e.g. "2018-W40")
 */
const _getTimeRange = (data) => {
  const weeks = data.map((d) => d.week);
  return [...new Set(weeks)];
};

/**
 * @returns {function} returns the an array of unique weeks present in the payload in
 * long ISO 8601 format (e.g. "2018-11-19T00:00:00.000-05:00")
 */
const _getTimeRangeISO = (weeks) => {
  const weeksISO = weeks.map((d) => {
    return DateTime.fromFormat(d, "kkkk-'W'WW").toISO();
  });
  return weeksISO;
};

/**
 * @returns {function} returns the min and max values of the main variable (eg. mean),
 * used to create a color scale (fixed to the mean at the moment)
 */
const _getVariableExtent = (data) => {
  return extent(data, (d) => parseFloat(d.mean));
};

/**
 * @param {string} modellingDisplayVariable the selected model statistic (e.g. mean)
 * @returns {function} returns an array of objects of length = demes/map detail. Every object
 * is, e.g. for the Central neighborhood: {2018-W30: x, 2018-W31: x, ..., key: "Central"},
 * with x = modellingDisplayVariable per week per neighborhood
 */
const _flattenNest = (data, modellingDisplayVariable) => {
  const arr = [];
  const nest = Array.from(group(data, (d) => d.region));

  nest.map((d) => {
    const rObj = {};
    d[1].map((e) => {
      rObj[e.week] = parseFloat(e[variable]);
      return rObj;
    });
    rObj.key = d[0];
    arr.push(rObj);
  });
  return arr;
};


/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */

export const areModelResultsReady = (state) => state.modelResults.ready;

export const selectModelErrorMessage = (state) => state.modelResults.message;

export const selectModelResults = (modelData, demes, geoLinks, geoResolution, modellingDisplayVariable) => {
  const flatDate = _flattenNest(modelData, 'mean');
  const varExtent = _getVariableExtent(modelData);
  const weeks = _getTimeRange(modelData);
  const weeksISO = _getTimeRangeISO(weeks);

  return {
    modelData,
    demes,
    geoLinks,
    geoResolution,
    modellingDisplayVariable,
    weeks,
    weeksISO,
    varExtent,
    flatDate
  };
};

export default modelResults;
