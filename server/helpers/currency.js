const axios = require('axios');

class CurrencyService {
  constructor() {
    // Average exchange rate if API is not available (1 USD = 132.30 NPR as of Feb 2024)
    this.fallbackRate = 132.30;
  }

  async convertNPRtoUSD(nprAmount) {
    try {
      // Replace this with your preferred currency API
      // Using fallback rate for now
      const usdAmount = nprAmount / this.fallbackRate;
      return parseFloat(usdAmount.toFixed(2));
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Use fallback rate if API fails
      const usdAmount = nprAmount / this.fallbackRate;
      return parseFloat(usdAmount.toFixed(2));
    }
  }

  formatNPR(amount) {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  }
}

const currencyService = new CurrencyService();
module.exports = currencyService;
