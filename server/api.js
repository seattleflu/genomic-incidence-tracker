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
   * (It's hardcoded here for simplicity)
   */

  res.json({
    pathogen: {
      sidebarLabel: "Pathogen",
      choices: [
        {value: "ILI", label: "ILI"}
      ]
    },
    geoResolution: {
      sidebarLabel: "Map Detail",
      choices: [
        {value: "neighborhood", label: "Neighborhood"}, // first is the default
        {value: "all", label: "Whole of Seattle"},
        {value: "cra", label: "CRAs"},
        {value: "census", label: "Census Tracts"}
      ]
    },
    dataSource: {
      sidebarLabel: "Data Source",
      choices: [
        {value: "raw", label: "Raw Data"},
        {value: "model", label: "Modelling Results"}
      ]
    },
    time: {
      sidebarLabel: "Time Frame",
      choices: [
        {value: "fixed", label: "To Do"}
      ]
    },
    primaryVariable: {
      sidebarLabel: "Primary Variable",
      choices: [
        {value: "vaxStatus", label: "Vaccination Status"},
        {value: "sex", label: "Sex"},
        {value: "age", label: "Age Groups"}
      ]
    },
    groupByVariable: {
      sidebarLabel: "Group By",
      choices: [
        {value: "vaxStatus", label: "Vaccination Status"}, // first is the default
        {value: "sex", label: "Sex"},
        {value: "age", label: "Age Groups"}
      ],
      unset: true
    }
  });

};


const addHandlers = (app) => {
  app.get("/getData", getDataExample);
  app.get("/getAvailableVariables", getAvailableVariables);
};

module.exports = {
  addHandlers
};
