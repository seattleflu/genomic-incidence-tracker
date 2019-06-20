import { createSelector } from 'reselect';
import * as types from "../actions/types";

/**
 * The name of this reducer may change as we better understand what data
 * is available and in what formats.
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
 * @param {object} variable a chosen variable (primary or group-by).
 *  Obligatory keys: `value`, `label`, `type`. Optional keys: `bins`
 */
const _variableToCategory = (data, variable) => {
  let category;

  switch (variable.type) {
    case "boolean":
      category = data[variable.value] ? "Yes" : "No";
      break;
    case "categorical":
      category = data[variable.value];
      break;
    case "continuous":
      const value = parseInt(data[variable.value], 10); /* TO DO -- may not be an int! */
      for (const bin of variable.bins) {
        /* bins are half open [a, b) where a=bin[0], b=bin[1]. bin[2] is category label */
        if (value >= bin[0] && value < bin[1]) {
          category = bin[2];
          break;
        }
      }
      break;
    default:
      throw Error(`invalid variable type ${variable.type}`);
  }

  return category;
};

/**
 * Returns a function that, when called with the data point's pathogen value,
 * will return `true` if it should be part of the selection, `false` otherwise
 * @param {Object} pathogen keys: `label`, `value`, ...
 * @results {function} returns true/false
 */
const _createPathogenFilter = (pathogenSelected) => {
  if (pathogenSelected.value === "all") {
    return () => true;
  } else if (pathogenSelected.value === "allPositive") {
    return (pathogen) => pathogen !== undefined;
  }
  return (pathogen) => pathogen === pathogenSelected.value;
};

/**
 * Filter the "raw" results and return an array of data points with the relevent info
 * for vizualisation.
 *
 * TO DO - the filters shouldn't have different shapes!
 *
 * @param {Object|false} groupByFilter keys: `variable` {Object} the groupByChoice, `categoryToMatch` {string}
 * @param {function} pathogenFilter function used in a conditional (true: include)
 * @returns {Array} List of data points, each with 2 keys: `deme` and `value`
 */
const _createFilteredResults = (results, groupByFilter, pathogenFilter, geoLinks, geoResolution, primaryVariable) => {
  const dataPoints = [];
  let missingDataCount = 0; // eslint-disable-line
  results.forEach((d) => {
    try {
      /* only consider points matching the groupBy variable (if needed) */
      if (groupByFilter) {
        if (_variableToCategory(d, groupByFilter.variable) !== groupByFilter.valueToMatch) {
          throw Error(`filtered out`);
        }
      }
      /* only consider points matching the pathogen filter */
      if (!pathogenFilter(d.pathogen)) {
        throw Error(`filtered out`);
      }

      const point = {};
      point.deme = geoLinks[d.residence_census_tract][geoResolution.value];
      point.value = _variableToCategory(d, primaryVariable);

      if (!point.value || !point.deme) {
        throw Error("invalid value / deme");
      }
      dataPoints.push(point);
    } catch (err) {
      missingDataCount++;
    }
  });

  // const filterMsg = groupByFilter.variable ? ` with ${groupByFilter.variable.value} filtered to ${groupByFilter.valueToMatch}` : "";
  // console.log(`Data transform for ${primaryVariable.value}${filterMsg}: ${dataPoints.length} points OK, ${missingDataCount} excluded`);
  return dataPoints;
};

/**
 * Mostly copied from https://observablehq.com/@jotasolano/flu-incidence/2.
 */
const _flattenData = (dataPoints, categories, demes) => {
  let maxValue = 0; /* maximum count of data points in any deme */
  const counts = demes.map((deme) => {
    const point = {key: deme};
    categories.forEach((category) => {point[category] = 0;});
    let tmp = 0;
    dataPoints.forEach((d) => {
      if (d.deme === deme) {
        point[d.value]++;
        tmp++;
      }
    });
    if (tmp > maxValue) {
      maxValue = tmp;
    }
    return point;
  });
  return [counts, maxValue];
};

/**
 * Convert data expressed as counts to percentages
 */
const _calcPercentages = (categories, counts) => {
  return counts.map((d) => {
    const total = categories.map((c) => d[c]).reduce((acc, cv) => acc+cv, 0);
    const percs = {key: d.key};
    categories.forEach((c) => {
      percs[c] = (d[c] / total * 100).toFixed(1);
    });
    return percs;
  });
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
  switch (variable.type) {
    case "boolean":
      categories = ["Yes", "No"];
      break;
    case "categorical":
      categories = [];
      results.forEach((d) => {
        const value = d[variable.value];
        if (value && !categories.includes(value)) {
          categories.push(value);
        }
      });
      break;
    case "continuous":
      categories = variable.bins.map((b) => b[2]);
      break;
    default:
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

export const selectRawDataResults = (results, categories, demes, geoLinks, geoResolution, pathogenSelected, primaryVariable, groupByVariable, groupByValue) => {
  if (!categories.length || !demes || !results || !primaryVariable) {
    return false;
  }
  const groupByFilter = groupByVariable ? {variable: groupByVariable, valueToMatch: groupByValue} : false;
  const pathogenFilter = _createPathogenFilter(pathogenSelected);
  const dataPoints = _createFilteredResults(results, groupByFilter, pathogenFilter, geoLinks, geoResolution, primaryVariable);
  const [counts, maxValue] = _flattenData(dataPoints, categories, demes);
  const percentages = _calcPercentages(categories, counts);
  return {
    pathogen: pathogenSelected,
    demes,
    counts,
    percentages,
    categories,
    maxValue,
    primaryVariable,
    groupByVariable,
    groupByValue
  };
};

export default resultsReducer;

