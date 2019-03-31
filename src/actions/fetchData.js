import * as types from "./types";

export const getAvailableVariables = () => async (dispatch) => {
  try {
    const data = await fetch('/getAvailableVariables')
      .then((res) => res.json());
    dispatch({type: types.SET_AVAILIABLE_VARIABLES, data});
  } catch (err) {
    console.error("Error in getAvailableVariables");
    console.error(err);
  }
};
