import { select } from "d3-selection";
import 'd3-transition';
import { geoPath, geoMercator } from "d3-geo";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";


/* TO DO -- we are simply using the selector designed for the table.
   we should build a better one to avoid all the data transforming here!
*/

const unknownFill = "rgb(150, 150, 150)";

/* this should be handled by a selector */
const transformToPercentages = (categories, flatData) => {
  const vizCategory = categories[0]; // TO DO -- how should we pick this?
  const demePercs = {};
  flatData.forEach((d) => {
    const deme = d.key;
    const total = categories.map((c) => d[c]).reduce((acc, cv) => acc+cv, 0);
    demePercs[deme] = d[vizCategory] / total * 100;
  });
  return demePercs;
};


/**
 * a function to render a mapbox / D3 map, intended to be called from a useEffect hook
 *
 * Currently we are _only_ displaying a simple chrolopleth fill, so we simply fill demes
 * with grey _unless_ the primaryVariable has n=2 categories (e.g. boolean
 * or categorical with 2 cats)
 *
 * Note that the colour scales for multiple maps (faceting) will be different! TO DO
 *
 * P.S. see the note on the JSDoc for renderD3Table
 */
export const renderMap = ({ref, width, height, resultsData, geoJsonData, geoResolution, geoLinks}) => {

  if (!resultsData || !geoJsonData || !ref) {
    return undefined;
  }

  const {primaryVariable, flatData, categories, groupByVariable, groupByValue} = resultsData;
  const titleText = `Map of ${geoResolution.label} showing ${primaryVariable.label}${groupByVariable ? ` with ${groupByVariable.label} restricted to ${groupByValue}` : ""}`;

  let fill; // will be passed to d3, so can be a string or a function receiving a data point
  if (categories.length !== 2) {
    console.warn(`Cannot display simple chloropleth for this ${primaryVariable.label} with ${categories.length} categories`);
    fill = unknownFill;
  } else {
    const demePercs = transformToPercentages(categories, flatData);
    const maxPerc = Object.keys(demePercs).reduce((res, deme) => demePercs[deme] > res ? demePercs[deme] : res, 0);

    /* Fn to extract the deme name from an individual geoJSON feature */
    const getDemeName = (d) => geoLinks[d.properties.GEOID][geoResolution.value];

    /* A D3 colour scale -- currently we only work with simple chloropleths */
    const colourScale = scaleSequential(interpolateBlues).unknown("#ccc").domain([0, maxPerc]);

    fill = (d) => {
      const deme = getDemeName(d);
      return colourScale(demePercs[deme]);
    };
  }


  /* D3 path generator for demes -- see https://github.com/d3/d3-geo */
  const geoPathGenerator = geoPath()
    .projection(
      geoMercator()
        .fitExtent([[0, 0], [width, height]], geoJsonData)
    );


  select(ref)
    .selectAll("*")
    .remove();

  /* mainly for debugging -- to be improved! */
  select(ref)
    .append("span")
    .text(titleText);

  const svg = select(ref)
    .append('svg')
    .style('background-color', 'white')
    .attr('width', width)
    .attr('height', height);

  svg.append("g")
    .attr("class", "geoShapes")
    .selectAll("path")
    .data(geoJsonData.features)
    .enter()
    .append("path") /* the rendered shape */
    .attr("fill", fill)
    .attr("stroke", "white")
    .attr("d", geoPathGenerator);

  return undefined;
};
