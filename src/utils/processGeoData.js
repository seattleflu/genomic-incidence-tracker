export const getDemes = ({geoData, geoResolution}) => {
  return geoData[geoResolution.value].demes;
};
