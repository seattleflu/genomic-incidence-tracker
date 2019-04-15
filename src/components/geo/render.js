import React from "react";
import { select, event as d3event } from "d3-selection";
import 'd3-transition';
import { geoPath, geoMercator } from "d3-geo";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolatePlasma } from "d3-scale-chromatic";
import { axisBottom } from "d3-axis";
import { getColorScale, getLegend } from "../table/render";
import { lichtenstein } from "./lichtenstein";

const calcDims = (width, height) => {
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
  return dims;
};

const renderTitles = (svg, dims, mainTitle, subTitle) => {
  /* render the (text) titles */
  svg.append("text")
    .attr("transform", `translate(${dims.legx1}, ${dims.tity1})`)
    .text(mainTitle);
  svg.append("text")
    .attr("transform", `translate(${dims.legx1}, ${dims.tity2})`)
    .text(subTitle);
};

const renderContinuousLegend = (svg, dims, colorScale) => {
  const legend = {};
  legend.scale = colorScale;
  legend.axis = axisBottom()
    .scale(
      scaleLinear()
        .range([dims.legx1, dims.legx2-dims.legx1])
        .domain(colorScale.domain())
    )
    .tickSize(6)
    .ticks(8)
    .tickFormat((d) => `${d}%`);

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
};

/**
 * return a function which will generate the on-hover info text
 */
const makeMakeInfoText = (getDemeName, demePercs) => (d) => {
  const deme = getDemeName(d);
  const value = parseInt(demePercs[deme], 10);
  if (value !== +value) {
    return `No data for ${deme}`;
  }
  return `${deme}: ${value}%`;
};

const setUpSvg = (ref, width, height) => {
  select(ref)
    .selectAll("*")
    .remove();
  const svg = select(ref)
    .append('svg')
    .style('background-color', 'white')
    .attr('width', width)
    .attr('height', height);
  return svg;
};

const renderDemes = (svg, geoJsonFeatures, pathGenerator, fillFn, stroke, strokeWidth, handleMouseEnter, handleMouseLeave) => {
  svg.append("g")
  .attr("class", "geoShapes mouseHandlers")
  .selectAll("path")
  .data(geoJsonFeatures)
  .enter()
  .append("path") /* the rendered shape */
  .attr("fill", fillFn)
  .attr("stroke", stroke)
  .attr("stroke-width", strokeWidth)
  .attr("d", pathGenerator)
  .on("mouseenter", handleMouseEnter)
  .on("mouseleave", handleMouseLeave);
};

/* TO DO -- both of these render methods have way too many args... */
const renderChloropleth = ({svg, categories, percentages, getDemeName, primaryVariable, groupByVariable, groupByValue, handleHoverOver, handleHoverOut, dims, geoJsonData, geoPathGenerator}) => {
  /* DATA TRANSFORMS */
  const vizCategory = categories[0]; /* what category do we want to visualise? (e.g. % Male or % Female ?!?) */
  const demePercs = {}; /* maps deme name to a percentage value */
  percentages.forEach((d) => {demePercs[d.key] = d[vizCategory];});

  /* RENDERING PREPERATION */
  const makeInfoText = makeMakeInfoText(getDemeName, demePercs);
  const mainTitle = `${primaryVariable.label}. Showing % ${vizCategory}`;
  const subTitle = groupByVariable ? `${groupByVariable.label} restricted to ${groupByValue}` : "";
  const colorScale = scaleSequential(interpolatePlasma)
    .unknown("#ccc")
    .domain([0, 100]);
  const fillFn = (d) => colorScale(demePercs[getDemeName(d)]);
  const handleMouseEnter = (d) => {handleHoverOver(makeInfoText(d), d3event.pageX, d3event.pageY);};

  /* RENDERING */
  renderTitles(svg, dims, mainTitle, subTitle);
  renderDemes(svg, geoJsonData.features, geoPathGenerator, fillFn, "white", "1px", handleMouseEnter, handleHoverOut);
  renderContinuousLegend(svg, dims, colorScale);
};

const renderLichtenstein = ({svg, categories, percentages, getDemeName, geoResolution, primaryVariable, groupByVariable, groupByValue, handleHoverOver, handleHoverOut, dims, geoJsonData, geoPathGenerator, projection}) => {
  const mainTitle = `${primaryVariable.label} with ${categories.length} categories`;
  const subTitle = groupByVariable ? `${groupByVariable.label} restricted to ${groupByValue}` : "";
  const makeInfo = (d, i) => {
    // TO DO -- use styled components, make into a table
    return (
      <>
        <div style={{fontWeight: 600}}>{getDemeName(d)}</div>
        {categories.map((c) => (<div key={c}>{`${c}: ${percentages[i][c]}%`}</div>))}
      </>
    );
  };
  const colorScale = getColorScale(categories);
  const legend = getLegend(categories, colorScale);
  const handleMouseEnter = (d, i) => {handleHoverOver(makeInfo(d, i), d3event.pageX, d3event.pageY);};
  const options = {};
  options.dotSpacing = geoResolution.value === "all" ? 10 : geoResolution.value === "neighborhood" ? 5 : geoResolution.value === "cra" ? 3 : 1.5;
  options.dotRadius = options.dotSpacing / 2.5;
  const l = lichtenstein({dims, options, geoPathGenerator, projection, geoJsonData, categories, getDemeName, percentages, colorScale, handleMouseEnter, handleMouseLeave: handleHoverOut});


  /* RENDERING */
  renderTitles(svg, dims, mainTitle, subTitle);
  /* render the legend -- this code is essentially copied from the table */
  svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${dims.x1},${dims.legy1})`)
    .call(legend);
  svg.append("g")
    .attr("class", "dots-container")
    .selectAll("g")
    .data(geoJsonData.features)
    .enter()
    .each(l);
};

/**
 * a function to render a mapbox / D3 map, intended to be called from a useEffect hook
 * Note that the colour scales differ between maps when faceting (TO DO).
 * Currently rerenders everything (sometimes slow!)
 * P.S. see the note on the JSDoc for renderD3Table
 */
export const renderMap = ({ref, width, height, resultsData, geoJsonData, geoResolution, geoLinks, handleHoverOver, handleHoverOut}) => {
  if (!resultsData || !geoJsonData || !ref) return undefined;
  const {primaryVariable, percentages, categories, groupByVariable, groupByValue} = resultsData;

  /* chart dimensions */
  const dims = calcDims(width, height);

  /* projection we will use for converting geoJSON shapes to paths (etc) */
  const projection = geoMercator()
    .fitExtent([[dims.x1, dims.y1], [dims.x2-dims.x1, dims.y2-dims.y1]], geoJsonData);

  /* D3 path generator for demes -- see https://github.com/d3/d3-geo */
  const geoPathGenerator = geoPath()
    .projection(projection);

  /* Fn to extract the deme name from an individual geoJSON feature */
  const getDemeName = (d) => geoLinks[d.properties.GEOID][geoResolution.value];

  const svg = setUpSvg(ref, width, height);
  if (resultsData.categories.length === 2) {
    renderChloropleth({svg, categories, percentages, getDemeName, primaryVariable, groupByVariable, groupByValue, handleHoverOver, handleHoverOut, dims, geoJsonData, geoPathGenerator});
  } else {
    renderLichtenstein({svg, width, height, categories, percentages, getDemeName, geoResolution, primaryVariable, groupByVariable, groupByValue, handleHoverOver, handleHoverOut, dims, geoJsonData, geoPathGenerator, projection});
  }
  return undefined;
};

