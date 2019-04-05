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
    */
    const data = [];
    let missingDataCount = 0;
    privateData.forEach((d) => {
      try {
        const point = {};
        point.deme = geoLinks[d.residence_census_tract][geoResolution.value];
        if (primaryVariable.value === "flu_shot") {
          point.value = d.flu_shot ? "Yes" : "No";
        } else if (primaryVariable.value === "sex") {
          point.value = d.sex;
        } else if (primaryVariable.value === "age") {
          const age = parseInt(d.age, 10);
          if (age > 15) {
            point.value = ">15";
          } else if (age > 4) {
            point.value = "4-15";
          } else if (age > 0) {
            point.value = "<5";
          } else {
            throw Error("invalid age");
          }
        } else {
          throw Error("invalid xVariable.value");
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
    const categories = [...new Set(data.map((d) => d.value))];

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
