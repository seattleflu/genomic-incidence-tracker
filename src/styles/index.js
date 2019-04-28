

/* Colour pallettes come from the seattle flu website
 * but may need updating
 */
const neutral = {
  100: "#EDEFEF",
  200: "#C9CED0",
  600: "#626D71",
  800: "#2A2F30"
};

const fz = {
  large: '24px',
  medium: '20px',
  small: '16px',
  tiny: '12px'
};

export const mainTheme = {
  mainFont: 'Lato, Helvetica Neue, Helvetica, sans-serif',
  fontLarge: fz['large'],
  fontMedium: fz['medium'],
  fontSmall: fz['small'],
  fontTiny: fz['tiny'],
  neutral,
  sidebarBackground: neutral[100],
  mainBackground: "white",
  colorSubheading: neutral[600]
};

/* I took this object from Auspice, not sure if we'll end up using it here

const sidebarThemeDefaults = {
  background: "#30353F",
  color: "#D3D3D3",
  // "font-family": "Lato, Helvetica Neue, Helvetica, sans-serif",
  sidebarBoxShadow: "rgba(255, 255, 255, 1)",
  selectedColor: "#5DA8A3",
  unselectedColor: "#BBB",
  unselectedBackground: "#888"
};
*/


export default mainTheme;
