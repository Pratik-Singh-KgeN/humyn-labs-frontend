import "@testing-library/jest-dom";
import { server } from "./msw/server";

// Start MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
