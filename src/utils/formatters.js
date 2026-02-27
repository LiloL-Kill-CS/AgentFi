export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '$0.00';
  
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(2) + 'B';
  }
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};
