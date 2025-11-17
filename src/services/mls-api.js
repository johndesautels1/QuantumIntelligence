export default {
  async getPropertyDetails(mlsNumber) {
    // MLS data requires paid API access (CoreLogic, ATTOM, etc.)
    return null;
  },

  getRoofCondition(age, type) {
    return age ? (age < 10 ? 'Excellent' : 'Fair') : 'Unknown';
  },

  calculateStructuralRisk(data) {
    return {
      recommendations: ['MLS data unavailable without paid API access']
    };
  }
};
