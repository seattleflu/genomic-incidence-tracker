import React from 'react';
import { hot } from 'react-hot-loader/root';
import MainScreen from "./components/mainScreen";
import DataFetch from "./components/DataFetch";

const Root = () => {
  return (
    <>
      <DataFetch/>
      <MainScreen/>
    </>
  );
};

export default hot(Root);
