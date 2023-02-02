import http from 'http';
import { serveTestApp } from './mocks/staticServer';
describe('Test got friend scan', () => {
  let server: http.Server;
  beforeAll(() => {
    server = serveTestApp();
  });
  afterAll(() => {
    server.close();
  });
  test('Test ', () => {
    console.log();
  });
});
