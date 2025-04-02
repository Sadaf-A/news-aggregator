export const toggleBoolean = (state: boolean) => !state;

export const handleClearCache = (callback: () => void) => {
  callback();
  return 'Cache cleared successfully';
};