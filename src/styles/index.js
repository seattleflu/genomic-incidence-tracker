

/* Colour pallettes come from the seattle flu website
 * but may need updating
 */
const neutral = {
  100: "#EDEFEF",
  200: "#C9CED0",
  600: "#626D71",
  800: "#2A2F30"
};

const colors = {
  blue: '#137CBD',
  green: '#0F9960',
  red: '#DB3737',
  orange: '#D9822B'
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
  colors,
  sidebarBackground: neutral[100],
  sidebarBoxShadow: "rgba(0, 0, 0, 0.2) -3px 0px 3px -3px",
  mainBackground: "white",
  selectedColor: "#5097BA",
  unselectedColor: "#333",
  unselectedBackground: "#888",
  colorSubheading: neutral[600]
};

export default mainTheme;
