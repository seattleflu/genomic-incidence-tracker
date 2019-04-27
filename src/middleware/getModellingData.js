import * as types from "../actions/types";
import { selectSettingsForModelRequest, isModelViewSelected } from "../reducers/settings";

const fetchModellingData = (body) => {
  const config = {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('user'),
      "Content-Type": "application/json"
    },
    credentials: 'omit', // no cookies!
    body: JSON.stringify(body)
  };
  if (!config.headers.Authorization) {
    throw new Error("No JWT (needed to fetch modelling results)");
  }
  return fetch('/getModelResults', config)
    .then((res) => {
      if (res.status !== 200) throw new Error(res.statusText);
      return res;
    })
    .then((res) => res.json());
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


  if (action.type === types.CHANGE_SETTING) {
    if (action.key === "dataSource" && action.value.value !== "model") {
      /* back to raw data view, clear (previous) model data & return */
      next({type: types.CLEAR_MODEL_DATA});
      return result;
    }
    if (!isModelViewSelected(state)) {
      /* not in modelling view, so no fetch required */
      return result;
    }
    /* before we fetch, clear any previous data */
    next({type: types.CLEAR_MODEL_DATA});

    /* this is the API request body -- one day this will go to the modelling server */
    const postBody = selectSettingsForModelRequest(state);
    let modelResults;
    try {
      modelResults = await fetchModellingData(postBody);
    } catch (err) {
      console.error("Error getting modeling results:");
      console.error(err);
      // TODO - should switch back to raw data view, but this isn't great for developing ;)
      return next({type: types.ERROR_MODEL_DATA, message: err.message});
    }
    return next({type: types.SET_MODEL_DATA, data: modelResults});
  }
};

export default getModellingDataMiddleware;
