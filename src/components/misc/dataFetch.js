import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import getGeoJsons from "../../actions/getGeoJsons";
import getResults from "../../actions/getResults";
import getAvailableVariables from "../../actions/getAvailableVariables";

const DataFetch = (fetchFunctions) => {
  useEffect(() => {
    for (const key of Object.keys(fetchFunctions)) {
      fetchFunctions[key]();
    }
  }, [fetchFunctions]); /* could also use [] as props _should_ never change */
  return null;
};

DataFetch.propTypes = {
  getAvailableVariables: PropTypes.func.isRequired,
  getGeoJsons: PropTypes.func.isRequired,
  getResults: PropTypes.func.isRequired
};

const mapDispatchToProps = { // https://react-redux.js.org/using-react-redux/connect-mapdispatch
  getAvailableVariables,
  getGeoJsons,
  getResults
};

export default connect(null, mapDispatchToProps)(DataFetch);
