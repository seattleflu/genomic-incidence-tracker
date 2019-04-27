const fs = require("fs");
const path = require("path");
const utils = require("./utils");
const parse = require('csv-parse/lib/sync'); // https://csv.js.org/parse/api/

/**
 * This API simply provides a development environment for the modeling
 * results as it is not available yet. It is not intended for production.
 */
const getModelResults = async (req, res) => {
  utils.log("getModelResults");
  const body = req.body;
  if (
    (body.pathogen !== "h3n2" && body.pathogen !== "h1n1pdm") ||
    body.outcome !== "relative_incidence" ||
    body.model_type !== "latent_field" ||
    body.model_version !== "latest" ||
    body.geoResolution !== "neighborhood" ||
    body.groupByVariable
  ) {
    res.statusMessage = `Model data for this set of variables is not yet available -- try H3N2 or H1N1, with neighborhood`;
    utils.warn(res.statusMessage);
    return res.status(500).end();
  }

  const fname = `../data/${body.model_type}_${body.pathogen}_NEIGHBORHOOD_DISTRICT_NAME.csv`;
  const dataRaw = fs.readFileSync(path.resolve(__dirname, fname), 'utf8');

  /* coerce into the same format as the "results" are */

  /* but... we need to convert the geo id used to the census level GEOID which the client uses */
  const geoData = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/seattle.geoJson"), 'utf8'));
  const nieghboToGeoid = {};
  geoData.census.features.forEach((feat) => {
    nieghboToGeoid[feat.properties.NEIGHBO] = feat.properties.GEOID;
  });

  const records = parse(dataRaw, {
    columns: true,
    skip_empty_lines: true
  });

  const results = [];
  records.forEach((record) => {
    if (record.epi_week !== body.epi_week) return;
    if (!nieghboToGeoid[record.NEIGHBORHOOD_DISTRICT_NAME]) {
      utils.warn(`unknown NEIGHBORHOOD_DISTRICT_NAME ${record.NEIGHBORHOOD_DISTRICT_NAME}. Discarding`);
      return;
    }
    results.push({
      residence_census_tract: nieghboToGeoid[record.NEIGHBORHOOD_DISTRICT_NAME],
      mean: record.latent_field_mean,
      mode: record.latent_field_mode,
      quintile: record.latent_field_quintile
    });
  });
  res.json(results);
};


const addHandlers = ({app, jwtMiddleware}) => {
  /* currently only "/getResults" requires a JWT check */
  app.post("/getModelResults", jwtMiddleware, getModelResults);
};

module.exports = {
  addHandlers
};
