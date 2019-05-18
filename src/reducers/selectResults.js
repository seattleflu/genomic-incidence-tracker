import { createSelector } from 'reselect';
import {selectCategoriesForPrimaryVariable, selectRawDataResults } from "./results";
import { selectDemes, selectGeoLinks} from "./geoData";
import { isModelViewSelected, selectGeoResolution, selectPathogen, selectModellingDisplayVariable } from "./settings";
import { selectModelResults } from "./modelResults";

/**
 * A factory which returns a memoised selector.

 * This needs to be a factory as we (may) be using the selector in
 * multiple components and each one needs "their own" selector, otherwise
 * memoisation (with a cache size of 1) doesn't work.
 * Note that mapStateToProps also needs to be a factory.
 * see https://github.com/reduxjs/reselect
 *
 * TO DO: this made perfect sense before the modelling results were built in
 * but one may wich to consider a cleaner way to do things.
 */
export const makeSelectDataForChart = () => {
  /**
   * A selector to get the data in the desired format, and with the desired
   * filters etc for visualisation.
   * This is memoised as there are data transforms involved.
   */
  return createSelector(
    [
      isModelViewSelected,
      (state) => state.results,
      (state) => state.modelResults.data,
      selectCategoriesForPrimaryVariable,
      selectDemes,
      selectGeoLinks,
      selectGeoResolution,
      selectPathogen,
      (state) => state.settings.primaryVariable.selected,
      (state) => state.settings.groupByVariable.selected,
      (state, props) => props.groupByValue,
      selectModellingDisplayVariable
    ],
    (
      modelView,
      results,
      modelData,
      categories,
      demes,
      geoLinks,
      geoResolution,
      pathogenSelected,
      primaryVariable,
      groupByVariable,
      groupByValue,
      modellingDisplayVariable
    ) => {
      if (modelView) {
        // console.log('hi', modelData);
        // return selectModelResults(modelData, demes, geoLinks, geoResolution, modellingDisplayVariable);
        return selectModelResults(modelData, demes, geoLinks, geoResolution, modellingDisplayVariable);
      }
      return selectRawDataResults(results, categories, demes, geoLinks, geoResolution, pathogenSelected, primaryVariable, groupByVariable, groupByValue);
    }
  );
};

