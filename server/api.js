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


const addHandlers = (app) => {
  app.get("/getData", getDataExample);
};

module.exports = {
  addHandlers
};
