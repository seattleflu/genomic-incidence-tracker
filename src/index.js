import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

/* Set up redux store here */
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import changeURLMiddleware from "./middleware/changeURL";

const reduxStore = ((initialState) => {
  const middleware = [
    thunk,
    changeURLMiddleware
  ];
  const composedEnhancers = compose(
    applyMiddleware(...middleware),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f
  );
  const store = createStore(rootReducer, initialState, composedEnhancers);
  if (process.env.NODE_ENV !== 'production' && module.hot) {
    // console.log("hot reducer reload"); // eslint-disable-line
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers/index');  // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
})();


const renderApp = () => {
  const Root = require("./root").default; // eslint-disable-line global-require
  ReactDOM.render(
    <Provider store={reduxStore}>
      <Root />
    </Provider>,
    document.getElementById('root')
  );
};

renderApp();

