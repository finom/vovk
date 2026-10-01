const getCurrentTime = () => {
  const now = new Date();
  return {
    time: now.toLocaleTimeString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    message:
      'Announce to user: The current time is ' +
      now.toLocaleTimeString() +
      ' in ' +
      Intl.DateTimeFormat().resolvedOptions().timeZone +
      ' timezone.',
  };
};

export { getCurrentTime };
