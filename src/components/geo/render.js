import { select } from "d3-selection";
import 'd3-transition';

/**
 * a function to render a mapbox / D3 map, intended to be called from a useEffect hook
 *
 *
 * P.S. see the note on the JSDoc for renderD3Table
 *
 */
export const renderMap = ({ref, width, height, data, geoResolution}) => {

  if (!data || !ref) {
    return undefined;
  }

  const {primaryVariable, groupByVariable, groupByValue} = data;

  const titleText = `Map of ${geoResolution.label} showing ${primaryVariable.label}${groupByVariable ? ` with ${groupByVariable.label} restricted to ${groupByValue}` : ""}`;

  select(ref)
    .selectAll("*")
    .remove();

  select(ref)
    .append("text")
    .text(titleText);

  return undefined;
};
