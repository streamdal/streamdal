import { Handlers } from "$fresh/server.ts";
import { getConfigs } from "root/lib/fetch.ts";
import "lodash";

const cleanObject = (obj: any): any => {
  const keysToRemove = ["WasmId", "WasmFunction"];

  if (_.isArray(obj)) {
    return _.compact(obj.map(cleanObject)).filter((o) => !_.isEmpty(o));
  } else if (_.isObject(obj)) {
    const cleanedObject = _.omitBy(
      _.mapValues(_.omit(obj, keysToRemove), cleanObject),
      (value) => _.isEmpty(value) && !_.isNumber(value),
    );

    _.forOwn(cleanedObject, (value, key) => {
      if (value === 0) {
        delete cleanedObject[key];
      }
    });

    return cleanedObject;
  }
  return obj;
};

const testObject = {
  "parent": {
    "child": {
      "foo": 0,
    },
    "baz": 1,
  },
};
export const handler: Handlers = {
  async GET() {
    const { config = {} } = await getConfigs();
    const cleanedConfig = cleanObject(config);

    const test = cleanObject(testObject);
    console.log("here is my test", test);
    return new Response(
      JSON.stringify(cleanedConfig, undefined, 2),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=streamdal-configs.json",
        },
      },
    );
  },
};
