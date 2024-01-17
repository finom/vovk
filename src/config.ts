if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT;
  const VOVK_PORT = process.env.VOVK_PORT;
  if (!PORT) throw new Error('PORT variable is not defined');
  if (!VOVK_PORT) throw new Error('VOVK_PORT variable is not defined');

  void fetch(`http://localhost:${process.env.VOVK_PORT}/__metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PORT }),
  })
    .then((resp) => {
      if (!resp.ok) {
        // eslint-disable-next-line no-console
        console.error(` 🐺 Failed to send config to Vovk Server: ${resp.statusText}`);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(` 🐺 Failed to send config to Vovk Server: ${err}`);
    });
}
