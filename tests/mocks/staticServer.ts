import express from 'express';
import path from 'path';
export const PORT_TEST = 8000;

export const serveTestApp = (port = PORT_TEST, staticFolderPath = 'mock-public') => {
  const app = express();
  app.use(express.static(path.join(__dirname, staticFolderPath)));
  const server = app.listen(port, () => {
    console.log(`Test static server listen to port  ${port}`);
  });
  return server;
};
