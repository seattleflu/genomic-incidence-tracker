import React, {useRef, useEffect} from 'react';
import { connect } from "react-redux";
import styled from 'styled-components';
import { select } from "d3-selection";
import 'd3-transition';
import { scaleLinear, scaleBand, scaleSequential } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { stack } from "d3-shape";
import { interpolateSpectral } from "d3-scale-chromatic";
import { getDemes } from "../../utils/processGeoData";


export const tableDimensions = {
  minWidth: 700,
  maxWidth: 1000,
  minHeight: 550,
  maxHeight: 1000
};

const Placeholder = styled.div`
  background-color: aquamarine;
  min-width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  min-height: ${(props) => props.height}px;
  max-height: ${(props) => props.height}px;
  font-size: 20px;
`;

const expensiveRender = (domRef, privateData, width, height, xVariable, geoData, geoResolution) => {
  /* https://observablehq.com/@jotasolano/flu-incidence/2 */

  if (!privateData || !geoData) {
    return null;
  }

  const UNKNOWN = "unknown";
  const demes = getDemes({geoData, geoResolution});
  console.log("DEMES:", demes);

  function transformData() {
    const data = [];
    let missingDataCount = 0;
    privateData.forEach((d) => {
      try {
        const point = {};
        point.deme = geoData.links[d.residence_census_tract][geoResolution.value];
        if (xVariable.value === "flu_shot") {
          point.value = d.flu_shot ? "Yes" : "No";
        } else if (xVariable.value === "sex") {
          point.value = d.sex;
        } else if (xVariable.value === "age") {
          const age = parseInt(d.age, 10);
          if (age > 15) {
            point.value = ">15";
          } else if (age > 4) {
            point.value = "4-15";
          } else if (age > 0) {
            point.value = "<5";
          } else {
            throw Error("invalid age");
          }
        } else {
          throw Error("invalid xVariable.value");
        }
        if (!point.value || !point.deme) {
          throw Error("invalid value / deme");
        }
        data.push(point);
      } catch (err) {
        missingDataCount++;
      }
    });
    console.log(`Data Transform excluded ${missingDataCount} points (processed ${data.length})`);
    return data;
  }

  const data = transformData();
  console.log("D3 DATA", data);

  const categories = [...new Set(data.map((d) => d.value))];
  console.log("CATEGORIES:", categories);

  let maxYValue = 0;
  const flatData = (() => {
    return demes.map((deme) => {
      const point = {key: deme};
      categories.forEach((category) => {point[category] = 0;});
      let tmp = 0;
      data.forEach((d) => {
        if (d.deme === deme) {
          point[d.value]++;
          tmp++;
        }
      });
      if (tmp > maxYValue) {
        maxYValue = tmp;
      }
      return point;
    });
  })();
  console.log("FLAT DATA:", flatData, maxYValue);

  const stackedData = (stack().keys(categories))(flatData);
  console.log("STACKED DATA:", stackedData);


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


  select(domRef)
    .selectAll("*")
    .remove();

  const svg = select(domRef)
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
      .data(stackedData)
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


const Table = ({xVariable, geoResolution, geoData, width, height, privateData}) => {
  const refElement = useRef(null);

  useEffect(() => {
    expensiveRender(refElement.current, privateData, width, height, xVariable, geoData, geoResolution);
  });

  return (
    <Placeholder width={width} height={height}>
      <div ref={refElement}/>
    </Placeholder>
  );
};


const mapStateToProps = (state) => {
  /* use Memoized Selectors (library: reselect) for complex transforms */
  return {
    privateData: state.privateData
  };
};

export default connect(mapStateToProps)(Table);
