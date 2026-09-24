export const setAlarm = (seconds: number, callback: () => void) => {
  const timeoutId = setTimeout(() => {
    callback();
  }, seconds * 1000);

  return timeoutId; // save this if you want to be able to cancel it later
};
