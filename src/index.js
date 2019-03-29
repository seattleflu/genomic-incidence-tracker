import React from "react";
import ReactDOM from "react-dom";


// const store = configureStore();

const renderApp = () => {
  const Root = require("./root").default; // eslint-disable-line global-require
  ReactDOM.render(
    <Root />,
    document.getElementById('root')
  );
  // ReactDOM.render(
  //   <Provider store={store}>
  //     <Root />
  //   </Provider>,
  //   document.getElementById('root')
  // );
};

renderApp();

