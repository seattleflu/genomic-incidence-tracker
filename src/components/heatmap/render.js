import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import { timeMonth } from "d3-time";
import { axisTop, axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import { interpolateReds } from "d3-scale-chromatic";


/* CSS classes can't have spaces, special chars etc */
const makeClassName = (x) => x.replace(/[ /<>+]/g, '_');
const transitionDuration = 1000;

const renderContainer = (ref, width, height) => {
  const div = select(ref)
    .append('div')
    .style('background-color', 'white')
    .attr('width', width + "px")
    .attr('height', '500')
    .style('overflow', 'auto')
    .style('height', '500px'); // unless I also set the height as a style, the overflow won't work
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

const renderSVGHeader = (ref, width, height) => {
  const svg = select(ref)
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  return svg;
};


// /**
//  * this is the "main" axis that will remain static even with
//  * internal scrolling of the table
//  */
const renderXAxis = (ref, dims, xAxis) => {
  const g = ref.append('g')
    .attr("class", "x axis")
    .attr("transform", `translate(0,${dims.legendHeight - 2})`);

  g.call(xAxis)
    .selectAll(".tick line")
    .attr("stroke", "#8A9BA8");
  return g;
};

// /**
//  * a secondary axis function so that we can have ticks that go all the way
//  * down the table, but no text or actual "scale"
//  */
const renderXAxisTicks = (ref, dims, xAxis) => {
  const g = ref.append('g')
    .attr("class", "x axis")
    .attr("class", "internal")
    .attr("transform", `translate(0,0)`);

  const axis = g.call(xAxis);

  axis.selectAll(".tick line")
    .attr("stroke", "#8A9BA8");

  axis.selectAll(".tick text").remove();

  axis
    .selectAll(".domain").remove();
  return g;
};

const renderYAxis = (svg, dims, yAxis) => {
  const g = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${dims.x1},0)`)
    .call(yAxis);
  return g;
};


// /**
//  * Initial render of the (horizontal) bars
//  */
const renderBars = (svg, data, colorScale, yScale, dims, weeks) => {
  const domEl = svg.append("g").attr("class", "bars");

  weeks.forEach((week, i) => {
    const className = makeClassName(`bar-${week}`);
    domEl.selectAll(`.${className}`)
      .data(data[i], (d) => `${d}.${className}`)
      .enter().append("rect")
      .attr("class", () => className)
      .attr("x", (d) => dims.x1 + d[0])
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => (d[1]) - d[0])
      .attr("height", yScale.bandwidth())
      .attr("stroke", "white")
      .attr("fill", (d) => colorScale(d.data[week]));
  });

  return domEl;
};

// /**
//  * By using the same data key, we can replace the dataset and transition between the values
//  */
const updateBars = (domBars, data, colorScale, yScale, dims, weeks) => {
  weeks.forEach((week, i) => {
    const className = makeClassName(`bar-${week}`);
    domBars.selectAll(`.${className}`)
      .data(data[i], (d) => `${d}.${className}`)
      .transition()
      .duration(transitionDuration)
      .attr("x", (d) => dims.x1 + d[0])
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => (d[1]) - d[0])
      .attr("fill", (d) => colorScale(d.data[week]));
  });
};

const renderTitle = (svg, dims, text) => {
  svg.append("g")
    .attr("class", "title")
    .attr("transform", `translate(${0},${dims.yTitle})`)
    .append("text")
    .attr("font-family", "Lato, Helvetica Neue, Helvetica, sans-serif")
    .text(text);
};

const renderLegend = (svg, dims, axis) => {
  svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${dims.x2 + dims.x1 - 300},${dims.yLegend})`)
    .call(axis);
};

const getLegend = (svg, dims, colorScale) => {
  const linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

  linearGradient.selectAll("stop")
    .data([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) /* gradient percs */
    .enter()
    .append("stop")
    .attr("offset", (d) => `${d}%`)
    .attr("stop-color", (d) => {
      const chloroPerc = (d/100) * (colorScale.domain()[1] - colorScale.domain()[0]) + colorScale.domain()[0];
      return colorScale(chloroPerc);
    });

  svg.append("g")
    .attr("class", "legend gradient")
    .append("rect")
    .attr("width", 300)
    .attr("height", dims.colorBarHeight)
    .attr("transform", `translate(${(dims.x2 + dims.x1 - 300)},${dims.yLegend})`)
    .style("fill", "url(#linear-gradient)");
};


const getXScaleAndAxis = (dims, uniqueDates) => {
  const xScale = scaleTime()
    .domain(extent(uniqueDates.map((d) => new Date(d))))
    .range([dims.x1, dims.x1 + dims.x2]);

  const xAxisHeader = axisTop(xScale)
    .ticks(timeMonth.every(1))
    .tickSizeInner(-1 * dims.height);

  const xAxisBody = (selection) => {
    selection.call(
      axisTop(xScale)
        .ticks(timeMonth.every(1))
        .tickSizeInner(-1 * dims.height)
    );
    selection.selectAll(".tick line")
      .attr("stroke", "#8A9BA8");
    selection.selectAll(".tick text")
      .remove();
    selection.selectAll(".domain")
      .remove();
  };
  return [xScale, xAxisHeader, xAxisBody];
};

const getYScaleAndAxis = (dims, demes) => {
  const y = scaleBand()
    .domain(demes)
    .range([dims.y1, (demes.length * 28) - 20])
    .padding(0.5)
    .align(0)
    .round(true);

  const yAxis = axisLeft(y)
    .tickSizeOuter(0);

  return [y, yAxis];
};

const getColorScaleAndAxis = (minAndMax) => {
  const colorScale = scaleSequential(interpolateReds)
    .domain(minAndMax)
    .unknown("#ccc");

  const colorAxis = axisBottom()
    .scale(
      scaleLinear()
        .range([0, 300])
        .domain(colorScale.domain())
    )
    .tickSize(10)
    .ticks(8);

  return [colorScale, colorAxis];

};

// const colorScale = scaleSequential(interpolateReds)
//   .unknown("#ccc");

// const colorAxis = axisBottom()
//   .scale(
//     scaleLinear()
//       .range([0, 300])
//       .domain(colorScale.domain())
//   )
//   .tickSize(10)
//   .ticks(8);

const getDims = (width, height) => {
  const dims = {
    x1: 130, /* left margin, measured L-R */
    x2: width - 140, /* right margin, measured L-R */
    y1: 0, /* top margin, measured T-B */
    y2: height - 20, /* bottom margin, measured T-B */
    yTitle: 15,
    yLegend: 20
  };
  dims.width = dims.x2 - dims.x1;
  dims.height = dims.y2 - dims.y1;
  dims.legendHeight = 60;
  dims.colorBarHeight = 10;
  return dims;
};

const initialRender = (domRef, ref, width, height, dims, demes, data, weeksISO, weeks, varExtent, titleText) => {
  const [xScale, xAxisHeader, xAxisBody] = getXScaleAndAxis(dims, weeksISO);
  const [yScale, yAxis] = getYScaleAndAxis(dims, demes);
  const [colorScale, colorAxis] = getColorScaleAndAxis(varExtent);
  ref.yScale = yScale; /* store to avoid recalculation for updates */

  /*            R E N D E R           */

  ref.header = renderSVGHeader(domRef, width, dims.legendHeight);
  ref.div = renderContainer(domRef, width, height);

  ref.svg = renderSVG(ref.div, width, height);
  ref.domXAxisInternal = renderXAxisTicks(ref.svg, dims, xAxisBody);
  ref.domYAxis = renderYAxis(ref.svg, dims, yAxis);
  ref.domBars = renderBars(ref.svg, data, colorScale, yScale, dims, weeks);
  renderTitle(ref.header, dims, titleText);
  getLegend(ref.header, dims, colorScale);
  renderLegend(ref.header, dims, colorAxis);
  ref.domXAxis = renderXAxis(ref.header, dims, xAxisHeader);
};

const transitionXValues = (ref, dims, data, weeks, weeksISO, color) => {
  const [xScale, xAxisHeader, xAxisBody] = getXScaleAndAxis(dims, weeksISO);
  ref.domXAxis.transition().duration(transitionDuration).call(xAxisHeader);
  ref.domXAxisInternal.transition().duration(transitionDuration).call(xAxisBody);

  updateBars(ref.domBars, data, color, ref.yScale, dims, weeks);
};

export const renderD3Table = ({ domRef, ref, width, height, data, titleText, selectedModellingDisplayVariable}) => {
  const { demes } = data;
  const dims = getDims(width, height);
  // I'm a bit confused as to why the total width of the chart is dims.width + dims.x1 and not dims.width
  const weekLength = (dims.width + dims.x1)/ data.weeks.length;
  const dataForVisualising = (stack().keys(data.weeks).value(weekLength))(data.flatDate);

  if (!ref.svg) { /* initial rendering of the chart */
    initialRender(domRef, ref, width, height, dims, demes, dataForVisualising, data.weeksISO, data.weeks, data.varExtent, titleText);
  } else if ((ref.selectedModellingDisplayVariable !== selectedModellingDisplayVariable) || ref.demes !== demes) {

    // not a real case yet, but this condition would be true if we change the modeling variable (e.g. mean to quintile)
    select(domRef).selectAll("*").remove();
    transitionXValues(ref, dims, data, data.weeks, data.weeksISO, colorScale);
  } else {
    console.warn("unhandled useEffect call - rerendering");
    select(domRef).selectAll("*").remove();
    initialRender(domRef, ref, width, height, dims, demes, dataForVisualising, data.weeksISO, data.weeks, data.varExtent, titleText);
  }

  /* save relevent "state" in `ref` so we can compare next time */
  ref.demes = demes;
  ref.pathogen = selectedModellingDisplayVariable;
  return undefined;
};
