import * as types from "./types";
import { checkObjectHas } from "./getAvailableVariables";

const setDemesAndLinksFromRawData = (geoData) => {
  /** hardcoded for prototyping only */

  /* ALL */
  geoData.all.demes = ["seattle"];
  /* NEIGHBORHOODS */
  geoData.neighborhood.demes = geoData.neighborhood.features.map((feat) => feat.properties.NEIGHBO);
  /* CRA */
  geoData.cra.demes = geoData.cra.features.map((feat) => feat.properties.CRA_NAM);
  /* CENSUS TRACTS */
  geoData.census.demes = geoData.census.features.map((feat) => feat.properties.GEOID);

  /* Set links for census tract (INT) -> appropriate deme */
  geoData.links = {};
  geoData.census.features.forEach((censusFeature) => {
    const id = censusFeature.properties.GEOID;
    geoData.links[String(id)] = {
      all: "seattle",
      neighborhood: censusFeature.properties.NEIGHBO,
      cra: censusFeature.properties.CRA_NAM,
      census: id
    };
  });
};

const checkAndTransformData = (jsonData) => {
  const data = {};
  checkObjectHas(jsonData, ["census", "cra", "neighborhood", "all"]);
  data.census = jsonData.census;
  data.all = jsonData.all;
  data.neighborhood = jsonData.neighborhood;
  data.cra = jsonData.cra;
  return data;
};


const getGeoJsons = () => async (dispatch) => {
  let data;
  try {
    const jsonData = await fetch('/getGeoJsons')
      .then((res) => res.json());
    data = checkAndTransformData(jsonData);
    setDemesAndLinksFromRawData(data);
  } catch (err) {
    console.error("Error fetching / transforming geo JSONs");
    console.error(err);
  }
  try {
    dispatch({type: types.SET_GEO_DATA, data});
  } catch (err) {
    console.error("Error dispatching SET_GEO_DATA");
    console.error(err);
  }
};

export default getGeoJsons;
