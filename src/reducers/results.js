import { createSelector } from 'reselect';
import * as types from "../actions/types";
import { selectDemes, selectGeoLinks} from "./geoData";
import { selectGeoResolution } from "./settings";

/**
 * The name of this reducer may change as we better understand what data
 * is available and in what formats. Currently there's no transforms
 * done, the JSON data is just dumped here, but that may also change
 * (this shouldn't be done until we have settled on an input data spec)
 */
const resultsReducer = (state = null, action) => {
  switch (action.type) {
    case types.SET_RESULTS:
      return action.data;
    default:
      return state;
  }
};


/**
 * Extract the given variable from the given data point object.
 * E.g. you want to get the subject's "age" from a singular data point.
 *
 * If the variable is continous then return the appropriate bin (aka category label)
 * @param {object} data an element of the results array
 * @param {object} variable a chosen variable (primary or group-by)
 */
const _variableToCategory = (data, variable) => {
  let category;
  if (variable.type === "boolean") {
    category = data[variable.value] ? "Yes" : "No";
  } else if (variable.type === "categorical") {
    category = data[variable.value];
  } else if (variable.type === "continuous") {
    const value = parseInt(data[variable.value], 10); /* TO DO -- may not be an int! */
    for (const bin of variable.bins) {
      /* bins are half open [a, b) where a=bin[0], b=bin[1]. bin[2] is category label */
      if (value >= bin[0] && value < bin[1]) {
        category = bin[2];
        break;
      }
    }
  } else {
    throw Error(`invalid variable type ${variable.type}`);
  }
  return category;
};

/**
 * Mostly copied from https://observablehq.com/@jotasolano/flu-incidence/2.
 * TO DO write documentation / break into smaller functions.
 * This is where most data transformation currently happens so it needs to be well documented
 */
const _convertToFlatFormat = (results, demes, categories, geoLinks, geoResolution, variable, filterVariable, filterCategoryToMatch) => {
  /* must guard against non-available data */
  if (!results || !variable) {
    return false;
  }
  /* create an array of processed data -- each entry is {value: A, deme: B}
  * (the list of all unique values is "categories")
  * and each deme B is in demes
  * this calculation could be performed once before the data
  * reaches the reducer. It's here for simplicity, but may well
  * be expensive!
  */
  const dataPoints = [];
  let missingDataCount = 0;
  results.forEach((d) => {
    try {
      /* if filterVariable is set (the "groupByVariable") then we only want
      to consider points which match this */
      if (filterVariable) {
        if (_variableToCategory(d, filterVariable) !== filterCategoryToMatch) {
          throw Error(`filtered out`);
        }
      }

      const point = {};
      point.deme = geoLinks[d.residence_census_tract][geoResolution.value];
      point.value = _variableToCategory(d, variable);

      if (!point.value || !point.deme) {
        throw Error("invalid value / deme");
      }
      dataPoints.push(point);
    } catch (err) {
      missingDataCount++;
    }
  });

  const filterMsg = filterVariable ? ` with ${filterVariable.value} filtered to ${filterCategoryToMatch}` : "";
  console.log(`Data transform for ${variable.value}${filterMsg}: ${dataPoints.length} points OK, ${missingDataCount} excluded`);

  let maxYValue = 0;
  const flatData = demes.map((deme) => {
    const point = {key: deme};
    categories.forEach((category) => {point[category] = 0;});
    let tmp = 0;
    dataPoints.forEach((d) => {
      if (d.deme === deme) {
        point[d.value]++;
        tmp++;
      }
    });
    if (tmp > maxYValue) {
      maxYValue = tmp;
    }
    return point;
  });

  return [
    flatData,
    maxYValue
  ];
};

/**
 * What categories are present for a given variable in the dataset?
 * E.g. for a continous variable, we want the binned labels.
 *      for a binary trait we return "Yes" and "No"
 *      for a categorical trait we return all categories (labels) in the data
 * @param {Array} results Array of individual data points. Same format as JSON input.
 * @param {Object} variable Variable to get categories for.
 * @returns {Array} list of category names (strings)
 * @throws if the variable type is not handled
 */
const getCategories = (results, variable) => {
  /* must guard against non-available data */
  if (!results || !variable) {
    return false;
  }
  // console.log("SELECTOR selectCategoriesFor:", variable.value);
  let categories;
  if (variable.type === "boolean") {
    categories = ["Yes", "No"];
  } else if (variable.type === "categorical") {
    categories = [];
    results.forEach((d) => {
      const value = d[variable.value];
      if (value && !categories.includes(value)) {
        categories.push(value);
      }
    });
  } else if (variable.type === "continuous") {
    categories = variable.bins.map((b) => b[2]);
  } else {
    throw Error(`invalid primaryVariable.type ${variable.type}`);
  }
  return categories;
};

/*                        S E L E C T O R S                            */
/* These should be the _only_ way data is accessed by react components */

export const selectCategoriesForPrimaryVariable = createSelector(
  [
    (state) => state.results,
    (state) => state.settings.primaryVariable.selected
  ],
  getCategories
);

export const selectCategoriesForGroupByVariable = createSelector(
  [
    (state) => state.results,
    (state) => state.settings.groupByVariable.selected
  ],
  getCategories
);

/**
 * A factory which returns a memoised selector.
 * The selector gets data in a format desired for vizualizing a chart
 * This is memoised as theres a data transform involved.
 *
 * This needs to be a factory as we (may) be using the selector in
 * multiple components and each one needs "their own" selector, otherwise
 * memoisation (with a cache size of 1) doesn't work.
 * Note that mapStateToProps also needs to be a factory.
 * see https://github.com/reduxjs/reselect
 */
export const makeSelectDataForChart = () => {
  return createSelector(
    [
      (state) => state.results,
      selectCategoriesForPrimaryVariable,
      selectDemes,
      selectGeoLinks,
      selectGeoResolution,
      (state) => state.settings.primaryVariable.selected,
      (state) => state.settings.groupByVariable.selected,
      (state, props) => props.groupByValue
    ],
    (results, categories, demes, geoLinks, geoResolution, primaryVariable, groupByVariable, groupByValue) => {
      if (!categories.length || !demes || !results) {
        return false;
      }
      // console.log("SELECTOR (data for chart)", primaryVariable.value, groupByValue);
      const [flatData, maxYValue] = _convertToFlatFormat(results, demes, categories, geoLinks, geoResolution, primaryVariable, groupByVariable, groupByValue);
      return {
        demes,
        flatData,
        categories,
        maxYValue,
        primaryVariable,
        groupByVariable,
        groupByValue
      };
    }
  );
};


export default resultsReducer;

