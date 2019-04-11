import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import { interpolateSpectral } from "d3-scale-chromatic";

/**
 * a function to render a D3 table, intended to be called from a useEffect hook
 *
 * right now it rerenders everything every time the react component receives different props,
 * however we can optimise it here via prop comparisons to just perform
 * the relevent D3 imperitive commands (this is how we would do transitions etc)
 * (this is better than using a second argument to "useEffect")
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
export const renderD3Table = ({ref, width, height, data}) => {
  // console.log("renderD3Table");
  if (!data || !ref) {
    return undefined;
  }
  const {categories, demes, flatData, maxYValue, primaryVariable, groupByVariable, groupByValue} = data;

  const titleText = `${primaryVariable.label}${groupByVariable ? ` with ${groupByVariable.label} restricted to ${groupByValue}` : ""}`;

  const dims = {
    x1: 120, /* left margin, measured L-R */
    x2: width - 140, /* right margin, measured L-R */
    y1: 70, /* top margin, measured T-B */
    y2: height - 30, /* bottom margin, measured T-B */
    yTitle: 30,
    yLegend: 60
  };
  dims.width = dims.x2 - dims.x1;
  dims.height = dims.y2 - dims.y1;

  const xScale = scaleLinear()
    .domain([0, maxYValue])
    .range([dims.x1, dims.x1 + dims.x2]);

  const xAxis = axisBottom(xScale)
    .ticks(width / 100, "s")
    .tickSizeInner(-1*(dims.y2 - dims.y1));

  const yScale = scaleBand()
    .domain(demes)
    .range([dims.y1, dims.y2]);

  const yAxis = axisLeft(yScale)
    .tickSizeOuter(0);

  const colorScale = scaleSequential((t) => interpolateSpectral(t * 0.8 + 0.1))
    .domain([0, categories.length-1].reverse())
    .unknown("#ccc");

  const legend = (svgRef) => {
    const g = svgRef
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("id", "legend")
      .selectAll("g")
      .data(categories)
      .join("g")
      .attr("transform", (d, i) => `translate(${i * 90 + 30},${0})`);

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


  select(ref)
    .selectAll("*")
    .remove();

  const svg = select(ref)
    .append('svg')
    .style('background-color', 'white')
    .attr('width', width)
    .attr('height', height);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${dims.y2})`)
    .call(xAxis)
    .selectAll(".tick line")
      .attr("stroke", "#8A9BA8");

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${dims.x1},0)`)
    .call(yAxis);

  svg.append("g")
    .attr("class", "bars")
    .selectAll("g")
      .data((stack().keys(categories))(flatData))
    .join("g")
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "white")
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => yScale(d.data.key))
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
      // .attr("height", 12);
      .attr("height", yScale.bandwidth());

  svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${dims.x1},${dims.yLegend})`)
    .call(legend);

  svg.append("g")
    .attr("class", "title")
    .attr("transform", `translate(${dims.x1},${dims.yTitle})`)
    .append("text")
    .text(titleText);


  return undefined;
};
