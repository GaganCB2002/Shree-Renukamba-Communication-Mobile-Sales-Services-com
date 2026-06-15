const axios = require('axios');

const lookupIMEI = async (imei) => {
  try {
    const response = await axios.get(`https://imei.info/api_checkimei/${imei}`, {
      timeout: 10000,
    });
    const data = response.data;

    const brand = data?.brand || data?.manufacturer || '';
    const model = data?.model || data?.device || '';
    const details = data?.details || {};

    return {
      brand: brand || '',
      model: model || '',
      specs: {
        'Model Name': details?.model_name || model,
        'Color': details?.color || '',
        'Storage': details?.storage || details?.memory || '',
        'Year Released': details?.year || '',
        'Network': details?.network || '',
        'Manufacturer': brand || '',
        'Device Type': details?.type || 'Smartphone',
        'IMEI': imei,
      },
    };
  } catch (err) {
    return null;
  }
};

const extractIMEIFromText = (text) => {
  const patterns = [
    /\b\d{15}\b/,
    /\b\d{14}\b/,
    /IMEI[:\s]*(\d{15})/i,
    /IMEI[:\s]*(\d{14})/i,
    /(?:IMEI|imei|Imei)[^0-9]*(\d{14,15})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const imei = match[1] || match[0];
      if (imei.length === 14 || imei.length === 15) {
        return imei;
      }
    }
  }
  return null;
};

module.exports = {
  lookupIMEI,
  extractIMEIFromText,
};
