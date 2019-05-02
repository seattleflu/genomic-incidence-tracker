import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import { interpolateSpectral } from "d3-scale-chromatic";

/* CSS classes can't have spaces, special chars etc */
const makeClassName = (x) => x.replace(/[ /<>+]/g, '_');
const transitionDuration = 1000;

const renderContainer = (ref, width, height) => {
  const div = select(ref)
    .append('div')
    .style('background-color', 'white')
    .attr('width', width + "px")
    .attr('height', height + "px");
  return div.node();
};

const renderSVG = (ref, width, height) => {
  const svg = select(ref)
    .append('svg')
    .style('background-color', 'white')
    .attr('width', width)
    .attr('height', height);
  return svg;
};


const renderAxis = (ref, dims, xAxis, width) => {
  const svg = select(ref)
    .attr('id', 'test')
    .append('svg')
    .attr('width', width)
    .attr('height', 30);

  const g = svg.append('g')
    .attr("class", "x axis");

  // g.attr("transform", `translate(0,${dims.y2})`)
    g.call(xAxis)
    .selectAll(".tick line")
    .attr("stroke", "#8A9BA8");
  return svg;
};

const renderXAxis = (svg, dims, xAxis) => {
  const g = svg.append("g")
    .attr("class", "x axis");
  g.attr("transform", `translate(0,${dims.y2})`)
    .call(xAxis)
    .selectAll(".tick line")
    .attr("stroke", "#8A9BA8");
  return g;
};

const renderYAxis = (svg, dims, yAxis) => {
  const g = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${dims.x1},0)`)
    .call(yAxis);
  return g;
};

/* update key for D3 data -- this allows us to swap out the dataset but keep keys consistent */
const makeUpdateKey = (d, categoryValue) => `${d.data.key}-${categoryValue}`;

/**
 * Initial render of the (horizontal) bars
 */
const renderBars = (svg, categories, data, colorScale, xScale, yScale) => {
  const domEl = svg.append("g").attr("class", "bars");
  categories.forEach((categoryValue, categoryIdx) => {
    const className = makeClassName(`bar-${categoryValue}`);
    domEl.selectAll(`.${className}`)
      .data(data[categoryIdx], (d) => makeUpdateKey(d, categoryValue))
      .enter().append("rect")
      .attr("fill", () => colorScale(categoryIdx))
      .attr("stroke", "white")
      .attr("stroke-width", "0.5px")
      .attr("class", className)
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      .attr("height", yScale.bandwidth());
  });
  return domEl;
};

/**
 * By using the same data key, we can replace the dataset and transition between the values
 */
const updateBars = (domBars, categories, data, xScale, yScale) => {
  categories.forEach((categoryValue, categoryIdx) => {
    const className = makeClassName(`bar-${categoryValue}`);
    domBars.selectAll(`.${className}`)
      .data(data[categoryIdx], (d) => makeUpdateKey(d, categoryValue))
      .transition()
      .duration(transitionDuration)
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]));
  });
};

const renderTitle = (svg, dims, text) => {
  svg.append("g")
    .attr("class", "title")
    .attr("transform", `translate(${dims.x1},${dims.yTitle})`)
    .append("text")
      .attr("font-family", "Lato, Helvetica Neue, Helvetica, sans-serif")
      .text(text);
};

const renderLegend = (svg, dims, legend) => {
  svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${dims.x1},${dims.yLegend})`)
    .call(legend);
};

const getLegend = (categories, colorScale) => (svg) => {
  const g = svg
    .attr("font-family", "Lato, Helvetica Neue, Helvetica, sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .attr("id", "legend")
    .selectAll("g")
    .data(categories)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * 60 + 30},${0})`);

  g.append("rect")
    .attr("x", -16)
    .attr("y", -16)
    .attr("width", 16)
    .attr("height", 16)
    .attr("fill", (d, i) => colorScale(i));

  g.append("text")
    .attr("x", -20)
    .attr("y", -8)
    .attr("dy", "0.35em")
    .text((d) => d);
};

const getXScaleAndAxis = (dims, domainEndValue) => {
  const xScale = scaleLinear()
    .domain([0, domainEndValue])
    .range([dims.x1, dims.x1 + dims.x2]);
  const xAxis = axisBottom(xScale)
    .ticks(dims.width / 50, "s")
    .tickSizeInner(-1*dims.height);
  return [xScale, xAxis];
};
const getYScaleAndAxis = (dims, demes) => {
  const yScale = scaleBand()
    .domain(demes)
    .range([dims.y1, dims.y2]);
  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0);
  return [yScale, yAxis];
};


const getDims = (width, height) => {
  const dims = {
    x1: 130, /* left margin, measured L-R */
    x2: width - 140, /* right margin, measured L-R */
    y1: 45, /* top margin, measured T-B */
    y2: height - 20, /* bottom margin, measured T-B */
    yTitle: 15,
    yLegend: 38
  };
  dims.width = dims.x2 - dims.x1;
  dims.height = dims.y2 - dims.y1;
  return dims;
};

const initialRender = (domRef, ref, width, height, dims, categories, demes, data, domainEndValue, titleText) => {
  const [xScale, xAxis] = getXScaleAndAxis(dims, domainEndValue);
  const [yScale, yAxis] = getYScaleAndAxis(dims, demes);
  ref.yScale = yScale; /* store to avoid recalculation for updates */
  const colorScale = scaleSequential((t) => interpolateSpectral(t * 0.8 + 0.1))
    .domain([0, categories.length-1].reverse())
    .unknown("#ccc");
  const legend = getLegend(categories, colorScale);



  /*            R E N D E R           */
  ref.div = renderContainer(domRef, width, height);
  ref.svg = renderSVG(ref.div, width, height);
  // ref.domXAxis = renderXAxis(ref.svg, dims, xAxis);
  ref.svgX = renderAxis(ref.div, dims, xAxis, width);
  ref.domYAxis = renderYAxis(ref.svg, dims, yAxis);
  ref.domBars = renderBars(ref.svg, categories, data, colorScale, xScale, yScale);
  renderTitle(ref.svg, dims, titleText);
  if (categories.length > 1) {
    renderLegend(ref.svg, dims, legend);
  }
};

const transitionXValues = (ref, dims, categories, data, domainEndValue) => {
  const [xScale, xAxis] = getXScaleAndAxis(dims, domainEndValue);
  ref.domXAxis.transition().duration(transitionDuration).call(xAxis);
  updateBars(ref.domBars, categories, data, xScale, ref.yScale);
};


/**
 * a function to render a D3 table, to be called from a useEffect hook
 *
 * The `ref` prop must be a `useRef` object. We use this to "save" information and
 * references with the knowledge that these will persist between calls. This is how
 * we can find out what updates / transitions are required. This requires us to code
 * the appropriate changes and either rerender or transition -- any uncaught cases
 * will rerender the entire chart and display a console warning.
 *
 * See https://observablehq.com/@jotasolano/flu-incidence/2 for prototype on which this is based
 *
 * Note: this can't be a custom hook unless you use a different mechanism
 * to store the "ref". This is due to the hook running before the initial
 * render, thus ref===null. Calling this inside "useEffect" causes it to
 * run after each render. An alternative would be to use a different mechanism
 * to store the ref such that the component reran when it was set. See example here:
 * https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
 *
 */
export const renderD3Table = ({domRef, ref, width, height, data, showAsPerc, titleText}) => {
  if (!data || !domRef) {
    return undefined;
  }
  const {pathogen, categories, demes, counts, percentages, maxValue, primaryVariable} = data;
  const dataForVisualising = (stack().keys(categories))(showAsPerc ? percentages : counts);
  const domainEndValue = showAsPerc ? 100 : maxValue;
  const dims = getDims(width, height);

  if (!ref.svg) { /* initial rendering of the chart */
    initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
  } else if ((primaryVariable && ref.primaryVariable !== primaryVariable) || ref.demes !== demes) {
    /* we could transition here if we wanted to... for primary variable this isn't too hard and would look nice,
    for deme changes you'd need to keep track of demes "in common" -- even though there really aren't any! */
    select(domRef).selectAll("*").remove();
    initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
  } else if (ref.showAsPerc !== showAsPerc || ref.pathogen !== pathogen) {
    /* change from percentage x-axis to counts (or vice versa) */
    transitionXValues(ref, dims, categories, dataForVisualising, domainEndValue);
  } else {
    console.warn("unhandled useEffect call - rerendering");
    select(domRef).selectAll("*").remove();
    initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
  }

  /* save relevent "state" in `ref` so we can compare next time */
  ref.showAsPerc = showAsPerc;
  ref.primaryVariable = primaryVariable;
  ref.demes = demes;
  ref.pathogen = pathogen;
  return undefined;
};
