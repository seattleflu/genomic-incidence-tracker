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

export const selectDataForTable = createSelector(
  /**
   * A memoised selector to return data for a table visualisation.
   * see https://github.com/reduxjs/reselect
   */
  [
    (state) => state.privateData,
    selectGeoLinks,
    selectDemes,
    (state) => state.settings.geoResolution.selected,
    (state) => state.settings.primaryVariable.selected,
    () => "to do"
  ],
  (privateData, geoLinks, demes, geoResolution, primaryVariable, groupByVariable) => {
    /** this is a selector to extract the relevent data for tables
     *  It is not optimised as data format will probably change
     */

    if (!privateData || !demes) {
      return false;
    }

    console.log("SELECTOR selectDataForTable", privateData, geoLinks, demes, geoResolution, primaryVariable, groupByVariable);

    /* create an array of processed data -- each entry is {value: A, deme: B}
    * where the collection of values are called "categories"
    * and each deme B is in demes
    * this calculation could be performed once before the data
    * reaches the reducer. It's here for simplicity, but may well
    * be expensive!
    */
    const data = [];
    let missingDataCount = 0;

    /* categories set up */
    let categories;
    if (primaryVariable.type === "boolean") {
      categories = ["Yes", "No"];
    } else if (primaryVariable.type === "categorical") {
      categories = []; /* will be filled is as we loop through the dataset */
    } else if (primaryVariable.type === "continuous") {
      categories = primaryVariable.bins.map((b) => b[2]);
    } else {
      throw Error(`invalid primaryVariable.type ${primaryVariable.type}`);
    }

    privateData.forEach((d) => {
      try {
        const point = {};
        point.deme = geoLinks[d.residence_census_tract][geoResolution.value];
        if (primaryVariable.type === "boolean") {
          point.value = d[primaryVariable.value] ? "Yes" : "No";
        } else if (primaryVariable.type === "categorical") {
          point.value = d[primaryVariable.value];
          if (point.value && !categories.includes(point.value)) {
            categories.push(point.value);
          }
        } else if (primaryVariable.type === "continuous") {
          const value = parseInt(d[primaryVariable.value], 10); /* TO DO -- may not be an int! */
          for (const bin of primaryVariable.bins) {
            /* bins are half open [a, b) where a=bin[0], b=bin[1]. bin[2] is category label */
            if (value >= bin[0] && value < bin[1]) {
              point.value = bin[2];
              break;
            }
          }
        } else {
          throw Error(`invalid primaryVariable.type ${primaryVariable.type}`);
        }
        if (!point.value || !point.deme) {
          throw Error("invalid value / deme");
        }
        data.push(point);
      } catch (err) {
        missingDataCount++;
      }
    });
    console.log(`Data transform: ${data.length} points OK, ${missingDataCount} excluded`);

    /* flatten data into a format D3 wants (!)
    * array witn one entry for each deme
    * each entry is {} with the demeName under key "key" and each
    * category is it's own key with the value being the count
    */
    let maxYValue = 0;
    const flatData = demes.map((deme) => {
      const point = {key: deme};
      categories.forEach((category) => {point[category] = 0;});
      let tmp = 0;
      data.forEach((d) => {
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

    return {
      demes,
      flatData,
      categories,
      maxYValue
    };
  }
);

export default privateDataReducer;

