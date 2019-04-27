import { select, event as d3event } from "d3-selection";
import 'd3-transition';
import { geoPath, geoMercator } from "d3-geo";
import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolatePlasma } from "d3-scale-chromatic";
import { axisBottom } from "d3-axis";

const unknownFill = "rgb(150, 150, 150)";

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
export const renderMap = ({ref, width, height, resultsData, modelViewSelected, selectedModellingDisplayVariable, geoJsonData, geoResolution, geoLinks, handleHoverOver, handleHoverOut}) => {
  if (!resultsData || !geoJsonData || !ref) return undefined;
  const {primaryVariable, categories, groupByVariable, groupByValue} = resultsData;
  let mainTitle = modelViewSelected ?
    `Modeling ${selectedModellingDisplayVariable.label} incidence` : primaryVariable.label;
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

  /* Fn to extract the deme name from an individual geoJSON feature */
  const getDemeName = (d) => geoLinks[d.properties.GEOID][geoResolution.value];


  /* calculate fills, legends etc based on the data type */
  let fill; // will be passed to d3, so can be a string or a function receiving a data point
  let legend;
  let makeInfo;
  if (categories.length > 2) {
    console.warn(`Cannot display simple chloropleth for this ${primaryVariable.label} with ${categories.length} categories`);
    fill = unknownFill;
    mainTitle += " (viz not implemented)";
    makeInfo = (d) => `${getDemeName(d)}`;
  } else {
    /* what category do we want to visualise? (e.g. % Male or % Female ?!?) */
    const vizCategory = categories[0];
    /* what are the values for this category for each deme? */
    const demeValues = {};
    let domainMax;
    if (modelViewSelected) {
      resultsData.counts.forEach((d) => {demeValues[d.key] = d[vizCategory];});
      domainMax = resultsData.maxValue;
    } else {
      resultsData.percentages.forEach((d) => {demeValues[d.key] = d[vizCategory];});
      domainMax = 100;
    }

    if (!modelViewSelected) {
      mainTitle += `. Showing % ${vizCategory}`;
    }

    /* A D3 colour scale -- currently we only work with simple chloropleths */
    const colourScale = scaleSequential(interpolatePlasma).unknown("#ccc").domain([0, domainMax]);

    /* What should the hover info box display? */
    makeInfo = (d) => {
      const deme = getDemeName(d);
      const value = modelViewSelected ? Number(demeValues[deme]).toFixed(4) : parseInt(demeValues[deme], 10);
      if (Number.isNaN(value)) {
        return `No data for ${deme}`;
      }
      return `${deme}: ${value}%`;
    };

    fill = (d) => {
      const deme = getDemeName(d);
      return colourScale(demeValues[deme]);
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
    .attr("d", geoPathGenerator)
    .on("mouseenter", (d) => {handleHoverOver(makeInfo(d), d3event.pageX, d3event.pageY);})
    .on("mouseleave", handleHoverOut);


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

