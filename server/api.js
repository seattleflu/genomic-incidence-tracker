const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require('body-parser');
const { log, warn, verbose } = require("./utils");

/*
 * This file contains the API handlers for the genomic incidence mapper
 * They are used during development by the server here (./index.js)
 * For the actual production site they may be imported by the seattleflu.org server
 * (assuming this app is located at seattleflu.org/tracker or similar)
 * This is why we organise them into a seperate file.
 * See also: "./auth.js"
 */

const getDataExample = async (req, res) => {
  res.json("Server returned data");

  /* example of how to handle failure: */
  // res.statusMessage = `Narratives couldn't be served -- ${err.message}`;
  // utils.warn(res.statusMessage);
  // res.status(500).end();
};

const getAvailableVariables = async (req, res) => {
  /* First attempt at getting the available variable choices
   * e.g. which primary variables are available?
   * (I imagine the shape of this data will drastically change)
   * (the way the _server_ accesses the data will also change, this is just for dev)
   */
  const fileContents = fs.readFileSync(path.resolve(__dirname, "../data/variableChoices.json"), 'utf8');
  res.json(JSON.parse(fileContents));
};

const getGeoJsons = async (req, res) => {
  /* data copied from the "seattle-geojson" repo.
   * (it may be that this repo is kept as the "source of truth"
   * and imported by the server.) Think of this as proof of principle.
   *
   * Keys match getAvailableVariables -> geoResolution -> choices[x] -> value
   */
  const fileContents = fs.readFileSync(path.resolve(__dirname, "../data/seattle.geoJson"), 'utf8');
  res.json(JSON.parse(fileContents));
};

const getResults = async (req, res) => {
  /* Due to current privacy concerns, no real results are committed
   * If the file "./dataPrivate/example-data-export.json" exists ("dataPrivate" is a gitignored directory)
   * then it is used, else a mock data file is used (this is committed, it is not real data)
   *
   * Note: This middleware is not an error handler (only 2 arguments) -- if there was an error in previous
   * middleware it will be skipped.
   */
  let fileContents;
  // console.log("getResults HEADERS", req.headers);
  try {
    fileContents = fs.readFileSync(path.resolve(__dirname, "../dataPrivate/results.json"), 'utf8');
    warn("getResults: Fetching the private results file ./dataPrivate/results.json. Ensure this is not committed.");
  } catch (err) {
    fileContents = fs.readFileSync(path.resolve(__dirname, "../data/results.json"), 'utf8');
    log("getResults: Fetching ./data/results.json");
  }
  return res.json(JSON.parse(fileContents));
};

const addHandlers = ({app, jwtMiddleware}) => {
  app.use(bodyParser.urlencoded({extended: false})); // parse application/x-www-form-urlencoded
  app.use(bodyParser.json()); // parse application/json

  app.get("/getData", getDataExample);
  app.get("/getAvailableVariables", getAvailableVariables);
  app.get("/getGeoJsons", getGeoJsons);
  /* currently only "/getResults" requires a JWT check */
  app.get("/getResults", jwtMiddleware, getResults);

  const fetchModellingData = async (req, res) => {
    const body = {
      model_type: "inla_latent",
      observed: ["encountered_week", "residence_neighborhood_district_name"],
      pathogen: [req.params.pathogen],
      spatial_domain: "seattle_geojson_neighborhood_district_name"
    };

    const config = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      json: true,
      credentials: 'omit', // no cookies!
      body: JSON.stringify(body)
    };

    const response = await fetch('http://40.112.165.255/v1/query', config);
    const data = await response.json();
    res.json(data);
  };

  app.get('/getModelResults/:pathogen', fetchModellingData);

};
module.exports = {
  addHandlers
};
