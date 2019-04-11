import * as types from "./types";

export const login = ({username, password}) => async (dispatch) => {
  /* We need to send the username & password to the server where it
   * is parsed by body-parser (express module)
   * Note that body-parser doesn't support form-data parsing.
   *
   * We send the request as stringified JSON, but you could also
   * use the content-type application/x-www-form-urlencoded, which
   * happens to be the default for `curl` which may help with testing
   *
   * There are lots of opinions about storing a JWT in localStorage
   * but it seems to be far better than storing it as a cookie.
   *
   * Remember also that someone can fake the token etc but it
   * will be rejected by the server on API call.
   */
  try {
    const contentType = "application/json"; // "application/x-www-form-urlencoded";
    const body = JSON.stringify({username, password}); // `username=${username}&password=${password}`
    const data = await fetch('/login', {
      method: "POST",
      headers: {
        "Content-Type": contentType
      },
      credentials: 'omit', // no cookies!
      body
    })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.statusText);
        return res;
      })
      .then((res) => res.json());

    if (!data.token) {
      throw new Error("Login response seemed successful but didn't include a token.");
    }
    localStorage.setItem('user', data.token);
    dispatch({ type: types.AUTH_SUCCESS, username}); // maybe should get username from token...
  } catch (err) {
    console.error(err.message);
    dispatch({type: types.AUTH_FAILED, message: err.message});
  }

};

