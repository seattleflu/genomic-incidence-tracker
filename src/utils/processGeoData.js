
export const setDemesAndLinksFromRawData = (geoData) => {
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
