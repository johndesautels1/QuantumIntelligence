const GOOGLE_MAPS_API_KEY = 'AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw';

export default {
  isConfigured() {
    return true;
  },

  getSatelliteImageUrl(lat, lng, options = {}) {
    const zoom = options.zoom || 19;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=640x400&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
  },

  getStreetViewImageUrl(lat, lng, options = {}) {
    // Default to a nice front-facing view
    const heading = options.heading || 0;
    const pitch = options.pitch || 0;
    return `https://maps.googleapis.com/maps/api/streetview?size=640x400&location=${lat},${lng}&fov=90&heading=${heading}&pitch=${pitch}&key=${GOOGLE_MAPS_API_KEY}`;
  }
};
