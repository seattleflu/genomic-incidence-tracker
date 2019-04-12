import { select } from "d3-selection";
import 'd3-transition';
import { geoPath, geoMercator } from "d3-geo";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { axisBottom } from "d3-axis";

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
  return [vizCategory, demePercs];
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

  if (!resultsData || !geoJsonData || !ref) return undefined;

  const {primaryVariable, flatData, categories, groupByVariable, groupByValue} = resultsData;

  let mainTitle = primaryVariable.label;
  const secondaryTitle = groupByVariable ? `${groupByVariable.label} restricted to ${groupByValue}` : "";

  const dims = {
    x1: 0, /* left margin, measured L-R */
    x2: width, /* right margin, measured L-R */
    y1: 90, /* top margin, measured T-B */
    y2: height, /* bottom margin, measured T-B */
    /* LEGEND */
    legx1: 10,
    legx2: width-10,
    legy1: 60,
    legHeight: 10,
    /* TITLES */
    tity1: 20,
    tity2: 40
  };

  /* D3 path generator for demes -- see https://github.com/d3/d3-geo */
  const geoPathGenerator = geoPath()
    .projection(
      geoMercator()
        .fitExtent([[dims.x1, dims.y1], [dims.x2-dims.x1, dims.y2-dims.y1]], geoJsonData)
    );

  /* calculate fills, legends etc based on the data type */
  let fill; // will be passed to d3, so can be a string or a function receiving a data point
  let legend;
  if (categories.length !== 2) {
    console.warn(`Cannot display simple chloropleth for this ${primaryVariable.label} with ${categories.length} categories`);
    fill = unknownFill;
    mainTitle += " (viz not implemented)";
  } else {
    const [vizCategory, demePercs] = transformToPercentages(categories, flatData);
    const maxPerc = Object.keys(demePercs).reduce((res, deme) => demePercs[deme] > res ? demePercs[deme] : res, 0);
    mainTitle += `. Showing % ${vizCategory}`;
    /* Fn to extract the deme name from an individual geoJSON feature */
    const getDemeName = (d) => geoLinks[d.properties.GEOID][geoResolution.value];

    /* A D3 colour scale -- currently we only work with simple chloropleths */
    const colourScale = scaleSequential(interpolateBlues).unknown("#ccc").domain([0, maxPerc]);

    fill = (d) => {
      const deme = getDemeName(d);
      return colourScale(demePercs[deme]);
    };

    legend = {};
    legend.scale = colourScale;
    legend.axis = axisBottom()
      .scale(
        scaleLinear()
          .range([dims.legx1, dims.legx2-dims.legx1])
          .domain(colourScale.domain())
      )
      .tickSize(6)
      .ticks(8)
      .tickFormat((d) => `${d}%`);
  }

  /* basic SVG set up */
  select(ref)
    .selectAll("*")
    .remove();
  const svg = select(ref)
    .append('svg')
    .style('background-color', 'white')
    .attr('width', width)
    .attr('height', height);

  /* render the (text) titles */
  svg.append("text")
    .attr("transform", `translate(${dims.legx1}, ${dims.tity1})`)
    .text(mainTitle);
  svg.append("text")
    .attr("transform", `translate(${dims.legx1}, ${dims.tity2})`)
    .text(secondaryTitle);

  /* render the actual geo shapes, apply fills etc */
  svg.append("g")
    .attr("class", "geoShapes")
    .selectAll("path")
    .data(geoJsonData.features)
    .enter()
    .append("path") /* the rendered shape */
    .attr("fill", fill)
    .attr("stroke", "white")
    .attr("d", geoPathGenerator);


  /* L E G E N D */
  if (legend) {
    /* the axis (the simple bit) */
    svg.append("g")
      .attr("class", "legend axis")
      .attr("transform", `translate(0, ${dims.legy1})`)
      .call(legend.axis);

    /* the gradient (the harder bit) */
    /* https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html */
    const linearGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
      .data([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) /* gradient percs */
      .enter()
      .append("stop")
      .attr("offset", (d) => `${d}%`)
      .attr("stop-color", (d) => {
        const chloroPerc = (d/100) * (legend.scale.domain()[1] - legend.scale.domain()[0]) + legend.scale.domain()[0];
        return legend.scale(chloroPerc);
      });

    svg.append("g")
      .attr("class", "legend gradient")
      .append("rect")
      .attr("width", dims.legx2-dims.legx1)
      .attr("height", dims.legHeight)
      .attr("transform", `translate(${dims.legx1}, ${dims.legy1-dims.legHeight+1})`)
      .style("fill", "url(#linear-gradient)");
  }

  return undefined;
};

