// module.exports = fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// con fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

import { RequestInfo, RequestInit } from 'node-fetch';
export const fetch = (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(module => module.default(url, init));

