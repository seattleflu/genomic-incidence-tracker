[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This repository contains the source code for the genomic incidence tracker for the [Seattle Flu Project](https://seattleflu.org/)


## Status: In development
Currently this repo only contains skeleton code to set up the project.
Relevant links:
* [Simulated Data](https://github.com/seattleflu/simulated-data)
* [Flu Incidence (Observable Notebook)](https://observablehq.com/@jotasolano/flu-incidence/2)
* [inVision prototype](https://projects.invisionapp.com/d/main#/console/16654565/353703459/preview)
* [map prototype (github repo)](https://github.com/seattleflu/seattle-flu-js-prototype)
* [geoJSON files](https://github.com/seattleflu/seattle-geojson)
* [auspice](http://github.com/nextstrain/auspice/)


## Installing / Running
Make sure node & npm are avalable in your current environment.
If you use conda, you can run:
```
conda env create -f environment.yml
```
Install dependencies:
```
npm install
```
Run:
```
npm run develop # development mode
npm run build && npm run view # production mode
```

## Development Server
This repo is running as a heroku server at https://genomic-incidence-tracker.herokuapp.com

## Development Aims / Notes
These are based on experience (good & bad) with auspice over the past two years.
This project will (hopefully) have contributions from a number of scientists and developers.
This section aims to provide some guidelines and reasoning for directions taken.


### React
We're using the latest stable version of React (16.8).
This includes [Hooks](https://reactjs.org/docs/hooks-intro.html), which should remove the need to use classes for react components.
As "there are no plans to remove classes from React", both can be used -- let's focus on clarity rather than the specific API used.
[This styleguide](https://github.com/iraycd/React-Redux-Styleguide) is a good read and has a number of useful and sensible suggestions.


### Redux
It has been extremely helpful with Auspice to have a central source of truth.
While there are plenty of "you don't need redux" blog posts, I think it's currently the best solution for an app like this.
(While the new context API is useful for some things, it is too slow to store all the state for an app like this. See [this thread](https://github.com/reduxjs/react-redux/issues/1177) for more details, including why it's still implemented as a HOC rather than a hook.)
Note that state limited to a component can -- and should -- simply use `this.setState` and `this.state` (or the `useState` Hook).


In the future we may choose to store state at the root level, e.g. using a [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer) hook and passing `dispatch` down [like this](https://reactjs.org/docs/hooks-faq.html#how-to-avoid-passing-callbacks-down).
But for now I think redux (and the provided dev tools) is the right choice.


### Styled Components
We recently started using these in Auspice and have found them much superior to the previous situation which was a mixture of CSS, "global" styles imported into files, and component-specific inline styles.
Similar to state management, there are plenty of articles about CSS-in-JS, both good and bad.
Using styled components should facilitate consistent theming and provide a central place to change things as needed.


### Component structure
To do.


### Mapbox
We are going to use mapbox to display the maps for this project.
Libraries: [mapbox-gl](https://www.npmjs.com/package/mapbox-gl) -- used in [the map prototype repo](https://github.com/seattleflu/seattle-flu-js-prototype), and [react-mapbox-gl](https://github.com/alex3165/react-mapbox-gl) -- used in the [seattle flu website](https://github.com/seattleflu/website/blob/master/src/components/Kiosks.js). TO DO.


### D3 - React
I'm sure we'll use D3 to render at least some of the visualisations.
The interface between react & D3 is/has been a source of a number of auspice bugs -- for instance, if a react update wants to change both colour and shape, then running 
```js
selection.style("fill", (d) => d.fill);
selection.style("stroke", (d) => d.stroke);
```
can lead to unexpected results! (It's even worse if transitions are happening).
We've had much more success using a single "update" function ([example](https://github.com/nextstrain/auspice/blob/master/src/components/entropy/entropyD3.js#L57)), which acts as a single interface between react & D3.


### Mobile
We should develop with both mobile & desktop views in mind, but de-emphasize interactions.
For the April 2019 prototype mobile will not be considered.


### Linting
Please use linting for all code -- the rules are intended to be helpful and prevent bugs as well as helping code remain consistent between developers (along with the editor config file).
The rules aren't supposed to be a hinderence, so let's change them as needed.
Feel free to deliberately disable for certain lines (`// eslint-disable-line`) as applicable.


### Types
A lot of people seem to love TypeScript (JS + types), but I have no experience with it.
If there are strong opinions then we could definately use it (my understanding is that you can use it on a file-by-file basis, but that may defeat the purpose).


Likewise, we used to use [React's PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) in Auspice, but have drifted away from them for no real reason.
I suggest we use them in this project, along with `defaultProps` and `displayName` where applicable.


### Testing
Ideally, unlike auspice, we will have some tests in this project!
These can probably wait until after we have a working prototype.
Having only used them a little bit, I like [jest](https://jestjs.io/) and [react-testing-library](https://kentcdodds.com/blog/introducing-the-react-testing-library/).


Travis-CI: TO DO.


### Documentation in the code
Where possible, using simple [JSDoc](http://usejsdoc.org/about-getting-started.html) comments are a good idea!


### Github
Non-time-critical changes should be merged into master using PRs with code review.


### Data requests (server API)
The current implementation sources all API handlers from `./server/api.js`.
These handlers should be easily imported into another server -- e.g. the [current seattleflu.org server](https://github.com/seattleflu/website/blob/master/server.js) -- as needed in the future. 
One example API is provided: localhost:4000/getData or https://genomic-incidence-tracker.herokuapp.com/getData

## Code Structure

* `./server/index.js` - The main CLI interface to running the project.
* `./server/api.js` - The server API handlers


## License and copyright
Copyright 2019 [Bedford Lab](https://bedford.io/)

Source code to Nextstrain is made available under the terms of the [GNU Affero General Public License](LICENSE.txt) (AGPL). Nextstrain is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.



