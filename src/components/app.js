import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { ThemeProvider } from 'styled-components';
import { mainTheme } from "../styles";
import Header from "./header";
import ErrorBoundary from "./misc/errorBoundary";
import DataFetch from "./misc/dataFetch";
import MainScreen from "./mainScreen";
import ReportScreen from "./reportScreen";
import RawDataScreen from "./rawDataScreen";
import Login from "./auth/login";
import CheckAuthentication from "./auth/checkAuthentication";

const renderScreen = (screen) => {
  if (screen === "main") {
    return (<MainScreen/>);
  } else if (screen === "report") {
    return (<ReportScreen/>);
  } else if (screen === "rawData") {
    return (<RawDataScreen/>);
  }
  /* to do - this throw is _not_ caught by the surrounding ErrorBoundary */
  throw Error(`Unknown screen "${screen}" to render`);
};

const App = ({screen}) => {
  return (
    <ErrorBoundary>
      <CheckAuthentication logInComponent={<Login/>}>
        <DataFetch/>
        <ThemeProvider theme={mainTheme}>
          <>
            <Header/>
            {renderScreen(screen)}
          </>
        </ThemeProvider>
      </CheckAuthentication>
    </ErrorBoundary>
  );
};

App.propTypes = {
  screen: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {screen: state.settings.screen};
};

export default connect(mapStateToProps)(App);

