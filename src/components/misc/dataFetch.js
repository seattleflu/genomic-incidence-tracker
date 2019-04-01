import React from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { getAvailableVariables, getGeoJsons } from "../../actions/fetchData";

/* This component fetches data when the app loads, that's it! */
class DataFetch extends React.Component {
  constructor(props) {
    super(props);
    /* fetch data for app ... */
    props.getAvailableVariables();
    props.getGeoJsons();
  }

  render() {
    return null;
  }
}

DataFetch.propTypes = {
  getAvailableVariables: PropTypes.func.isRequired,
  getGeoJsons: PropTypes.func.isRequired
};

const mapDispatchToProps = { // https://react-redux.js.org/using-react-redux/connect-mapdispatch
  getAvailableVariables,
  getGeoJsons
};

export default connect(null, mapDispatchToProps)(DataFetch);
