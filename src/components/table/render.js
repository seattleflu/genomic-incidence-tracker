import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import { interpolateSpectral } from "d3-scale-chromatic";

export const useD3ToRenderTable = ({ref, width, height, data}) => {
  /**
   * a custom react hook to render a D3 table
   * right now it rerenders everything
   * every time the react component receives different props,
   * however we can optimise it here via prop comparisons to just perform
   * the relevent D3 imperitive commands (this is how we would do transitions etc)
   *
   * See https://observablehq.com/@jotasolano/flu-incidence/2 for prototype on which this is based
   */

  if (!data) {
    return null;
  }
  const {categories, demes, flatData, maxYValue} = data;

  const dims = {
    x1: 120, /* left margin, measured L-R */
    x2: width - 140, /* right margin, measured L-R */
    y1: 40, /* top margin, measured T-B */
    y2: height - 50, /* bottom margin, measured T-B */
    yLegend: 30
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

};
