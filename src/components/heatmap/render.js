import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential, scaleTime } from "d3-scale";
import {extent } from "d3-array";
import { timeMonth } from "d3-time";
import { axisTop, axisLeft } from "d3-axis";
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

// /* update key for D3 data -- this allows us to swap out the dataset but keep keys consistent */
const makeUpdateKey = (d, categoryValue) => `${d.data.key}-${categoryValue}`;

// /**
//  * Initial render of the (horizontal) bars
//  */
const renderBars = (svg, data, colorScale, xScale, yScale, dims) => {
  const domEl = svg.append("g").attr("class", "bars");

  domEl.selectAll("g").data(data).join("g")
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
      .attr("x", (d) => dims.x1 + d[0])
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => (d[1]) - d[0])
      .attr("height", yScale.bandwidth())
      .attr("fill", function (d) { // eslint-disable-line
        const week = select(this.parentNode).datum().key;
        return colorScale(d.data[week]);
      });


  // categories.forEach((categoryValue, categoryIdx) => {
  //   const className = makeClassName(`bar-${categoryValue}`);
  //   domEl.selectAll(`.${className}`)
  //     .data(data[categoryIdx], (d) => makeUpdateKey(d, categoryValue))
  //     .enter().append("rect")
  //     .attr("fill", () => colorScale(categoryIdx))
  //     .attr("stroke", "white")
  //     .attr("stroke-width", "0.5px")
  //     .attr("class", className)
  //     .attr("x", (d) => xScale(d[0]))
  //     .attr("y", (d) => yScale(d.data.key))
  //     .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
  //     .attr("height", yScale.bandwidth());
  // });
  return domEl;
};

// /**
//  * By using the same data key, we can replace the dataset and transition between the values
//  */
// const updateBars = (domBars, categories, data, xScale, yScale) => {
//   categories.forEach((categoryValue, categoryIdx) => {
//     const className = makeClassName(`bar-${categoryValue}`);
//     domBars.selectAll(`.${className}`)
//       .data(data[categoryIdx], (d) => makeUpdateKey(d, categoryValue))
//       .transition()
//       .duration(transitionDuration)
//       .attr("x", (d) => xScale(d[0]))
//       .attr("y", (d) => yScale(d.data.key))
//       .attr("width", (d) => xScale(d[1]) - xScale(d[0]));
//   });
// };

// const renderTitle = (svg, dims, text) => {
//   svg.append("g")
//     .attr("class", "title")
//     .attr("transform", `translate(${0},${dims.yTitle})`)
//     .append("text")
//     .attr("font-family", "Lato, Helvetica Neue, Helvetica, sans-serif")
//     .text(text);
// };

// const renderLegend = (svg, dims, legend) => {
//   svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${50},${dims.yLegend})`)
//     .call(legend);
// };

// TODO: replace Legend with a color ramp key

const getXScaleAndAxis = (dims, uniqueDates) => {
  const xScale = scaleTime()
    .domain(extent(uniqueDates.map((d) => new Date(d))))
    .range([dims.x1, dims.x1 + dims.x2]);

  const xAxis = axisTop(xScale)
    .ticks(timeMonth.every(1))
    .tickSizeInner(-1 * dims.height);

  return [xScale, xAxis];
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


const getDims = (width, height) => {
  const dims = {
    x1: 130, /* left margin, measured L-R */
    x2: width - 140, /* right margin, measured L-R */
    y1: 0, /* top margin, measured T-B */
    y2: height - 20, /* bottom margin, measured T-B */
    yTitle: 15,
    yLegend: 38
  };
  dims.width = dims.x2 - dims.x1;
  dims.height = dims.y2 - dims.y1;
  dims.legendHeight = 60;
  return dims;
};

const initialRender = (domRef, ref, width, height, dims, demes, data, weeksISO, varExtent) => {
  const [xScale, xAxis] = getXScaleAndAxis(dims, weeksISO);
  const [yScale, yAxis] = getYScaleAndAxis(dims, demes);
  ref.yScale = yScale; /* store to avoid recalculation for updates */
  
  const colorScale = scaleSequential(interpolateReds)
    .unknown("#ccc")
    .domain(varExtent);

  /*            R E N D E R           */

  ref.header = renderSVGHeader(domRef, width, dims.legendHeight);
  ref.div = renderContainer(domRef, width, height);

  ref.svg = renderSVG(ref.div, width, height);
  ref.domXAxisInternal = renderXAxisTicks(ref.svg, dims, xAxis);
  ref.domYAxis = renderYAxis(ref.svg, dims, yAxis);
  ref.domBars = renderBars(ref.svg, data, colorScale, xScale, yScale, dims);
  // renderTitle(ref.header, dims, titleText);
  ref.domXAxis = renderXAxis(ref.header, dims, xAxis);
};

export const renderD3Table = ({ domRef, ref, width, height, data }) => {
  const { pathogen, categories, demes, counts, percentages, maxValue, primaryVariable } = data;
  const dims = getDims(width, height);
  const weekLength = dims.width/ data.weeks.length;
  const dataForVisualising = (stack().keys(data.weeks).value(weekLength))(data.flatDate);

  if (!ref.svg) { /* initial rendering of the chart */
    initialRender(domRef, ref, width, height, dims, demes, dataForVisualising, data.weeksISO, data.varExtent);
  } 
  // else if ((primaryVariable && ref.primaryVariable !== primaryVariable) || ref.demes !== demes) {
//     /* we could transition here if we wanted to... for primary variable this isn't too hard and would look nice,
//     for deme changes you'd need to keep track of demes "in common" -- even though there really aren't any! */
//     select(domRef).selectAll("*").remove();
//     initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
//   } else if (ref.showAsPerc !== showAsPerc || ref.pathogen !== pathogen) {
//     /* change from percentage x-axis to counts (or vice versa) */
//     transitionXValues(ref, dims, categories, dataForVisualising, domainEndValue);
//   } else {
//     console.warn("unhandled useEffect call - rerendering");
//     select(domRef).selectAll("*").remove();
//     initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
//   }


  // initialRender(domRef, ref, width, height, dims, demes, data);
};

// const initialRender = (domRef, ref, width, height, dims, categories, demes, data, domainEndValue, titleText) => {

//   /*            R E N D E R           */

//   ref.header = renderSVGHeader(domRef, width, dims.legendHeight);
//   ref.div = renderContainer(domRef, width, height);

//   ref.svg = renderSVG(ref.div, width, height);
//   ref.domXAxisInternal = renderXAxisTicks(ref.svg, dims, xAxis);
//   ref.domYAxis = renderYAxis(ref.svg, dims, yAxis);
//   ref.domBars = renderBars(ref.svg, categories, data, colorScale, xScale, yScale);
//   renderTitle(ref.header, dims, titleText);
//   if (categories.length > 1) {
//     renderLegend(ref.header, dims, legend);
//   }
//   ref.domXAxis = renderXAxis(ref.header, dims, xAxis);
// };

// const transitionXValues = (ref, dims, categories, data, domainEndValue) => {
//   const [xScale, xAxis] = getXScaleAndAxis(dims, domainEndValue);
//   ref.domXAxis.transition().duration(transitionDuration).call(xAxis);

//   // TODO: currently having issues with updating "domXAxisInternal", as the 'domain'
//   // of the scale gets redrawn when pressing the toggle button. Not sure what the
//   // best approach is. I've tried several without success


//   // ref.domXAxisInternal.transition().duration(transitionDuration)
//   //   .call(xAxis, (g) => console.log(g));

//   updateBars(ref.domBars, categories, data, xScale, ref.yScale);
// };


// export const renderD3Table = ({ domRef, ref, width, height, data, showAsPerc, titleText }) => {
//   if (!data || !domRef) {
//     return undefined;
//   }
//   const { pathogen, categories, demes, counts, percentages, maxValue, primaryVariable } = data;
//   const dataForVisualising = (stack().keys(categories))(showAsPerc ? percentages : counts);
//   const domainEndValue = showAsPerc ? 100 : maxValue;
//   const dims = getDims(width, height);

//   if (!ref.svg) { /* initial rendering of the chart */
//     initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
//   } else if ((primaryVariable && ref.primaryVariable !== primaryVariable) || ref.demes !== demes) {
//     /* we could transition here if we wanted to... for primary variable this isn't too hard and would look nice,
//     for deme changes you'd need to keep track of demes "in common" -- even though there really aren't any! */
//     select(domRef).selectAll("*").remove();
//     initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
//   } else if (ref.showAsPerc !== showAsPerc || ref.pathogen !== pathogen) {
//     /* change from percentage x-axis to counts (or vice versa) */
//     transitionXValues(ref, dims, categories, dataForVisualising, domainEndValue);
//   } else {
//     console.warn("unhandled useEffect call - rerendering");
//     select(domRef).selectAll("*").remove();
//     initialRender(domRef, ref, width, height, dims, categories, demes, dataForVisualising, domainEndValue, titleText);
//   }

//   /* save relevent "state" in `ref` so we can compare next time */
//   ref.showAsPerc = showAsPerc;
//   ref.primaryVariable = primaryVariable;
//   ref.demes = demes;
//   ref.pathogen = pathogen;
//   return undefined;
// };
