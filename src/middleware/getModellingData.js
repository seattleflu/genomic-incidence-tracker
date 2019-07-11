import * as types from "../actions/types";
import { selectSettingsForModelRequest, isModelViewSelected } from "../reducers/settings";

const fetchModellingData = async (pathogen) => {
  const response = await fetch(`/getModelResults/${pathogen}`);
  const data = await response.json();
  return data;
};

/**
 * What is this middleware?
 *
 * It intercepts actions which require a model recomputation
 * and makes the appropriate data fetch
 *
 * TODO: deal with the race condition of a change in variables before the
 * fetch returns etc (i.e. cancel the request, deal with things appropriately)
 *
 * TODO: we don't have URL query setting/parsing yet for the "dataSource" option
 * but when we do we will have to modify this code so that the appropriate fetch
 * is made.
 *
 * Note: while it's not always advised to call `next` multiple times as it
 * skips previous middleware, it's done deliberately here.
 *
 * Note: we should make sure we always return the value of `next`
 * but as this is the last middleware in the chain it doesn't
 * matter too much currently. See https://stackoverflow.com/a/45964310
 */
const getModellingDataMiddleware = (store) => (next) => async (action) => {
  const result = next(action);
  const state = store.getState();

  if (!isModelViewSelected(state) || action.type !== types.CHANGE_SETTING) {
    return result;
  }

  /* before we fetch, clear any previous data */
  next({type: types.CLEAR_MODEL_DATA});

  if (action.key === "dataSource" && action.value.value !== "model") {
    /* back to raw data view */
    return result;
  }



  const postBody = selectSettingsForModelRequest(state);
  console.log(postBody);

  let pathogenIDM;
  switch (postBody.pathogen) {
    case 'all':
      pathogenIDM = 'all'; // technically incorrect
      break;
    case 'allPositive':
      pathogenIDM = 'all';
      break;
    case 'h1n1pdm':
      pathogenIDM = 'Flu_A_H1';
      break;
    case 'h3n2':
      pathogenIDM = 'Flu_A_H3';
      break;
    default:
      throw Error(`Organism ${postBody.pathogen} not yet implemented.`);
  }

  console.log(pathogenIDM);
  let modelResults;
  try {
    modelResults = await fetchModellingData(pathogenIDM);
  } catch (err) {
    console.error("Error getting modeling results:");
    console.error(err);
    // TODO - should switch back to raw data view, but this isn't great for developing ;)
    return next({type: types.ERROR_MODEL_DATA, message: err.message});
  }
  return next({type: types.SET_MODEL_DATA, data: modelResults});

};

export default getModellingDataMiddleware;
