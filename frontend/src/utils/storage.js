export const STORAGE_KEYS = {
  appData: 'procurement-management-system-data',
};

export function getData(key) {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return null;
  }
}

export function setData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
}
