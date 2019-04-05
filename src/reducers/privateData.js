import { createSelector } from 'reselect';
import * as types from "../actions/types";
import { selectDemes, selectGeoLinks} from "./geoData";


/**
 * The name of this reducer will change as we better understand what data
 * can be shared with the client.
 */
const privateDataReducer = (state = null, action) => {
  switch (action.type) {
    case types.SET_PRIVATE_DATA:
      return action.data;
    default:
      return state;
  }
};


/**
 * Extract the variable from the data point and convert to a category label.
 * @param {object} data an element of the privateData array
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

const _convertToFlatFormat = (privateData, demes, categories, geoLinks, geoResolution, variable, filterVariable, filterCategoryToMatch) => {
  /* must guard against non-available data */
  if (!privateData || !variable) {
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
  privateData.forEach((d) => {
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

const getCategories = (privateData, variable) => {
  /* must guard against non-available data */
  if (!privateData || !variable) {
    return false;
  }
  console.log("SELECTOR selectCategoriesFor:", variable.value);
  let categories;
  if (variable.type === "boolean") {
    categories = ["Yes", "No"];
  } else if (variable.type === "categorical") {
    categories = [];
    privateData.forEach((d) => {
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

export const selectCategoriesForPrimaryVariable = createSelector(
  [
    (state) => state.privateData,
    (state) => state.settings.primaryVariable.selected
  ],
  getCategories
);

export const selectCategoriesForGroupByVariable = createSelector(
  [
    (state) => state.privateData,
    (state) => state.settings.groupByVariable.selected
  ],
  getCategories
);

/**
 * A memoised selector to return data for a table visualisation.
 * see https://github.com/reduxjs/reselect
 */
export const selectDataForTable = createSelector(
  [
    (state) => state.privateData,
    selectCategoriesForPrimaryVariable,
    selectDemes,
    selectGeoLinks,
    (state) => state.settings.geoResolution.selected,
    (state) => state.settings.primaryVariable.selected,
    (state) => state.settings.groupByVariable.selected,
    (state, props) => props.groupByValue
  ],
  (privateData, categories, demes, geoLinks, geoResolution, primaryVariable, groupByVariable, groupByValue) => {
    if (!categories.length || !demes || !privateData) {
      return false;
    }
    console.log("SELECTOR selectDataForTable");
    const [flatData, maxYValue] = _convertToFlatFormat(privateData, demes, categories, geoLinks, geoResolution, primaryVariable, groupByVariable, groupByValue);
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

export default privateDataReducer;

