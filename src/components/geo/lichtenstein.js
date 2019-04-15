import { geoContains } from "d3-geo";
import { select } from "d3-selection";

const constructDotsInDeme = (d, geoPathGenerator, spacing, projection) => {
  const dotData = [];
  const boundingBox = geoPathGenerator.bounds(d); // [[x0, y0], [x1, y1]] in pixels
  const xSearchStart = Math.floor(boundingBox[0][0] / spacing * spacing);
  const xSearchEnd = Math.ceil(boundingBox[1][0] / spacing * spacing);
  const ySearchStart = Math.ceil(boundingBox[1][1] / spacing * spacing);
  const ySearchEnd = Math.floor(boundingBox[0][1] / spacing * spacing);
  for (let y = ySearchStart; y > ySearchEnd; y-=spacing) {
    for (let x = xSearchStart; x < xSearchEnd; x+=spacing) { // to-do
      /* check if point (pixels) is inside bounding box */
      if (x > boundingBox[0][0] && x < boundingBox[1][0] && y > boundingBox[0][1] && y < boundingBox[1][1]) {
        /* convert to lat / longs and check if inside shape */
        const [long, lat] = projection.invert([x, y]);
        // console.log(`x: ${x}, y: ${y}`);
        if (geoContains(d, [long, lat])) {
          // console.log("\tIN");
          dotData.push([x, y]);
        }
      }
    }
  }
  return dotData;
};

/**
 * make a generator to be called `nDots` times
 * It will return the colours (for the dots)
 * such that the proportion of dots of a given colour is the correct deme perc
 */
function* makeColorGenerator(categories, demePercs, nDots, colorScale) {
  let categoryIdx = 0;
  let category = categories[categoryIdx];
  let dotsPlacedInCategorySoFar = 0;
  let numDotsInCategory = parseInt(demePercs[category]/100 * nDots, 10);
  const advanceCategory = () => {
    while (categoryIdx < categories.length) {
      categoryIdx++;
      category = categories[categoryIdx];
      dotsPlacedInCategorySoFar = 0;
      numDotsInCategory = Math.round(demePercs[category]/100 * nDots);
      if (numDotsInCategory) {
        break;
      }
    }
  };
  for (let j = 0; j < nDots; j++) {
    dotsPlacedInCategorySoFar++;
    if (dotsPlacedInCategorySoFar > numDotsInCategory) {
      /* jump to next category (before yield) */
      advanceCategory();
    }
    // console.log(`${j} - ${dotsPlacedInCategorySoFar}th of ${numDotsInCategory} for ${category}`);
    yield colorScale(categoryIdx);
  }
}

const defaultOptions = {
  dotSpacing: 5, // px
  dotRadius: 2, // px
  innerBorder: 4 // px, on inside of deme
};

/**
 * A function which makes a D3 method `l` to be called via `.call(l)` or `.each(l)`.
 *
 * This visualises a set of categorical variable associated with a shape.
 * Currently the shape must be geoJSON
 * Each category has a percentage associated with it
 *
 * The shape is "filled" with dots coored by `colorScale` in proportion
 * to the provided percentages.
 *
 * TO DO:
 * - If this prototype shows promise i'd like to generalise it and make it a D3 package
 * - 4 paths are drawn for each deme!
 * - try randomising the dots
 * - provide an options interface
 * - it's really really slow (easy to see when called many times)
 */
export function lichtenstein({geoPathGenerator, projection, geoJsonData, categories, getDemeName, percentages, colorScale, handleMouseEnter, handleMouseLeave, options}) {
  return function l(d, i) {
    const demePercs = percentages[i]; /* the percentages of each category in this deme */
    const opts = Object.assign({}, defaultOptions, options);
    const dotData = constructDotsInDeme(d, geoPathGenerator, opts.dotSpacing, projection);
    const colorGenerator = makeColorGenerator(categories, demePercs, dotData.length, colorScale);

    const g = select(this)
      .append('g')
      .attr("id", `dots-${getDemeName(d)}`);

    /* DEFINE THE CLIP MASK */
    g.append("defs")
      .append("clipPath")
      .attr("id", `clip-${getDemeName(d)}`)
      .attr("class", "clip")
      .append("path")
      .attr("d", geoPathGenerator);

    /* DRAW THE DOTS */
    g.append("g")
      .attr("class", "dots")
      .attr("clip-path", `url(#clip-${getDemeName(d)})`)
      .selectAll("demeDots")
      .data(dotData)
      .enter()
      .append("circle")
      .attr("cx", (dd) => dd[0])
      .attr("cy", (dd) => dd[1])
      .attr("r", opts.dotRadius)
      .attr("fill", () => colorGenerator.next().value);

    /* DRAW A BACKGROUND SHAPE WITH WHITE BORDER */
    select(this).append("g")
      .attr("class", "geoShapes white-outline")
      .selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path") /* the rendered shape */
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", `${opts.innerBorder}px`)
      .attr("d", geoPathGenerator);

    select(this).append("g")
      .attr("class", "geoShapes white-outline")
      .selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path") /* the rendered shape */
      .attr("fill", "rgb(0,0,0,0)") // fill needed to capture mouse handlers
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px")
      .attr("d", geoPathGenerator)
      .on("mouseenter", handleMouseEnter)
      .on("mouseleave", handleMouseLeave);
  };

}
