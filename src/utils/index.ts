// Formatting utilities
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Image utilities
export const getImageUri = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `https://your-api-domain.com/images/${imagePath}`;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const isValidPinCode = (pinCode: string): boolean => {
  const pinCodeRegex = /^[1-9][0-9]{5}$/;
  return pinCodeRegex.test(pinCode);
};

// String utilities
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Delay utility for testing loading states
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};