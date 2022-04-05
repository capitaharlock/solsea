import { stringify, parse } from "query-string";

export function stringifyQuery(data) {
  return stringify(data, {
    arrayFormat: "comma"
  });
}

export function parseQuery(params) {
  return parse(params, {
    arrayFormat: "comma",
    parseBooleans: true,
    parseNumbers: true
  });
}
