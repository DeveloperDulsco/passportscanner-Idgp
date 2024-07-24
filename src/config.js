let config = null;

export const fetchConfig = async () => {
  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      //throw new Error('Failed to load configuration');
    }
    config = await response.json();
  } catch (error) {
   // console.error('Error fetching configuration:', error);
  }
};

export const getConfig = () => {
  if (!config) {
   // throw new Error('Configuration has not been fetched yet');
  }
  return config;
};
