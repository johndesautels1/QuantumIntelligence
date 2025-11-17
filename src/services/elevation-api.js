export default {
  async getElevation(lat, lng) {
    try {
      const url = `https://epqs.nationalmap.gov/v1/epqs?x=${lng}&y=${lat}&units=Feet&output=json`;
      const response = await fetch(url);
      const data = await response.json();
      return parseFloat(data.value) || 0;
    } catch (error) {
      console.warn('USGS elevation fetch failed:', error);
      return 0;
    }
  }
};
