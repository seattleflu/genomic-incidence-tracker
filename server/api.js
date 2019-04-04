const fs = require("fs");
const path = require("path");

/*
 * This file contains the API handlers for the genomic incidence mapper
 * They are used during development by the server here (./index.js)
 * For the actual production site they may be imported by the seattleflu.org server
 * (assuming this app is located at seattleflu.org/tracker or similar)
 * This is why we organise them into a seperate file.
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

const localOnlyGetPrivateData = async (req, res) => {
  /* the JSON file here is (not yet) for public release, so it's stored in
   * the gitignored dataPrivate directory.
   *
   * Keys match ???
   */
  const fileContents = fs.readFileSync(path.resolve(__dirname, "../dataPrivate/example-data-export.json"), 'utf8');
  res.json(JSON.parse(fileContents));
};


const addHandlers = (app) => {
  app.get("/getData", getDataExample);
  app.get("/getAvailableVariables", getAvailableVariables);
  app.get("/getGeoJsons", getGeoJsons);
  app.get("/localOnlyGetPrivateData", localOnlyGetPrivateData);
};

module.exports = {
  addHandlers
};
