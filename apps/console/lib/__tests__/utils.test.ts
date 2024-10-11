import { assertEquals, assert } from "$std/testing/asserts.ts";
import { Audience, OperationType } from "streamdal-protos/protos/sp_common.ts";

import {
  titleCase,
  formatBytes,
  formatNumber,
  isNumeric,
  getAudienceOpRoute,
  getAudienceFromParams,
  getOpRoute,
  audienceKey,
  audienceFromKey,
  edgeKey,
  serviceKey,
  componentKey,
  operationKey,
  groupKey,
  lower,
  getAttachedPipelines,
  bigIntStringify,
  longDateFormat,
  humanDateFormat,
} from "../utils.ts";
import { PipelinesType } from "root/lib/fetch.ts";
import { Pipeline } from "streamdal-protos/protos/sp_pipeline.ts";

Deno.test("titleCase - should convert string to title case", () => {
  assertEquals(titleCase("hello world"), "Hello World");
  assertEquals(titleCase("JAVA script"), "Java Script");
  assertEquals(titleCase(""), "");
  assertEquals(titleCase(null), null);
  assertEquals(titleCase(undefined), undefined);
});

Deno.test("formatBytes - should format bytes correctly", () => {
  assertEquals(formatBytes(0), "0");
  assertEquals(formatBytes(500), "500");
  assertEquals(formatBytes(1500), "2kB");
  assertEquals(formatBytes(1500000), "2MB");
  assertEquals(formatBytes(1500000000), "1.5GB");
  assertEquals(formatBytes(1500000000000), "1.5TB");
});

Deno.test("formatBytes - should handle negative numbers", () => {
  assertEquals(formatBytes(-1500), "2kB");
});

Deno.test("formatBytes - should handle bigint", () => {
  assertEquals(formatBytes(BigInt(1500)), "2kB");
});

Deno.test("formatNumber - should format number in compact notation", () => {
  assertEquals(formatNumber(0), "0");
  assertEquals(formatNumber(100), "100");
  assertEquals(formatNumber(1500), "1.5K");
  assertEquals(formatNumber(2500000), "2.5M");
  assertEquals(formatNumber(BigInt(1500)), "1.5K");
});

Deno.test("formatNumber - should default to 0 when undefined", () => {
  assertEquals(formatNumber(undefined), "0");
});

Deno.test("isNumeric - should correctly identify numeric values", () => {
  assert(isNumeric(123));
  assert(isNumeric("123"));
  assert(isNumeric("  123  "));
  assert(isNumeric("123.45"));
  assert(!isNumeric("abc"));
  assert(!isNumeric(""));
  assert(!isNumeric(null));
  assert(!isNumeric(undefined));
  assert(!isNumeric(NaN));
});

Deno.test("getAudienceOpRoute - should generate correct route", () => {
  const audience: Audience = {
    serviceName: "service1",
    componentName: "component1",
    operationType: OperationType.PRODUCER,
    operationName: "op1",
  };

  assertEquals(
    getAudienceOpRoute(audience),
    "/service/service1/component/component1/PRODUCER/op/op1"
  );
});

Deno.test(
  "getAudienceFromParams - should construct Audience from params",
  () => {
    const params = {
      service: "service1",
      component: "component1",
      operationType: "CONSUMER",
      operationName: "op1",
    };

    const expectedAudience: Audience = {
      serviceName: "service1",
      componentName: "component1",
      operationType: OperationType.CONSUMER,
      operationName: "op1",
    };

    assertEquals(getAudienceFromParams(params), expectedAudience);
  }
);

Deno.test("getOpRoute - should generate correct operation route", () => {
  assertEquals(
    getOpRoute("service1", "component1", OperationType.CONSUMER, "op1"),
    "/service/service1/component/component1/CONSUMER/op/op1"
  );
});

Deno.test(
  "audienceKey and audienceFromKey - should generate and parse audience key correctly",
  () => {
    const audience: Audience = {
      serviceName: "Service1",
      componentName: "Component1",
      operationType: OperationType.CONSUMER,
      operationName: "Op1",
    };

    const key = audienceKey(audience);
    assertEquals(key, "service1:operation_type_consumer:op1:component1");

    const parsedAudience = audienceFromKey(key);
    assertEquals(parsedAudience, {
      serviceName: "service1",
      componentName: "component1",
      operationType: OperationType.CONSUMER,
      operationName: "op1",
    });
  }
);

Deno.test(
  "audienceKey and audienceFromKey - should handle producer operation type",
  () => {
    const audience: Audience = {
      serviceName: "Service2",
      componentName: "Component2",
      operationType: OperationType.PRODUCER,
      operationName: "Op2",
    };

    const key = audienceKey(audience);
    assertEquals(key, "service2:operation_type_producer:op2:component2");

    const parsedAudience = audienceFromKey(key);
    assertEquals(parsedAudience, {
      serviceName: "service2",
      componentName: "component2",
      operationType: OperationType.PRODUCER,
      operationName: "op2",
    });
  }
);

Deno.test(
  "edgeKey, serviceKey, componentKey, operationKey, groupKey - should generate correct keys",
  () => {
    const audience: Audience = {
      serviceName: "Service1",
      componentName: "Component1",
      operationType: OperationType.CONSUMER,
      operationName: "Op1",
    };

    assertEquals(
      edgeKey(audience),
      "service1/operation_type_consumer/component1"
    );
    assertEquals(serviceKey(audience), "service1-service");
    assertEquals(componentKey(audience), "component1-component");
    assertEquals(
      operationKey(audience),
      "service1:operation_type_consumer:op1:component1-operation"
    );
    assertEquals(groupKey(audience), "service1-consumer-component1-group");
  }
);

Deno.test("lower - should convert string to lowercase", () => {
  assertEquals(lower("HELLO"), "hello");
  assertEquals(lower("World"), "world");
  assertEquals(lower("TeSt123"), "test123");
  assertEquals(lower(""), "");
});

// TODO: test mocked DOM functions as well here

Deno.test(
  "getAttachedPipelines - should return pipelines attached to the audience",
  () => {
    const audience: Audience = {
      serviceName: "service1",
      componentName: "component1",
      operationType: OperationType.CONSUMER,
      operationName: "op1",
    };

    const pipelines: PipelinesType = {
      pipeline1: {
        pipeline: { id: "p1" } as Pipeline,
        audiences: [audience],
      },
      pipeline2: {
        pipeline: { id: "p2" } as Pipeline,
        audiences: [
          {
            serviceName: "service2",
            componentName: "component2",
            operationType: OperationType.PRODUCER,
            operationName: "op2",
          },
        ],
      },
    };

    const attached = getAttachedPipelines(audience, pipelines);
    assertEquals(attached, [{ id: "p1" } as Pipeline]);
  }
);

Deno.test(
  "getAttachedPipelines - should return empty array if no pipelines attached",
  () => {
    const audience: Audience = {
      serviceName: "service3",
      componentName: "component3",
      operationType: OperationType.CONSUMER,
      operationName: "op3",
    };

    const pipelines: PipelinesType = {
      pipeline1: {
        pipeline: { id: "p1" } as Pipeline,
        audiences: [
          {
            serviceName: "service2",
            componentName: "component2",
            operationType: OperationType.PRODUCER,
            operationName: "op2",
          },
        ],
      },
    };

    const attached = getAttachedPipelines(audience, pipelines);
    assertEquals(attached, []);
  }
);

Deno.test(
  "bigIntStringify - should stringify object with bigint correctly",
  () => {
    const obj = {
      a: 1,
      b: BigInt(2),
      c: "test",
      d: {
        e: BigInt(3),
      },
    };

    const json = bigIntStringify(obj);
    assertEquals(json, '{"a":1,"b":"2","c":"test","d":{"e":"3"}}');
  }
);

Deno.test("bigIntStringify - should stringify arrays with bigint", () => {
  const arr = [1, BigInt(2), "three", { four: BigInt(4) }];
  const json = bigIntStringify(arr);
  assertEquals(json, '[1,"2","three",{"four":"4"}]');
});

Deno.test(
  "Date Formats - longDateFormat should have correct properties",
  () => {
    assertEquals(longDateFormat, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hour12: true,
      minute: "numeric",
      fractionalSecondDigits: 3,
    });
  }
);

Deno.test(
  "Date Formats - humanDateFormat should have correct properties",
  () => {
    assertEquals(humanDateFormat, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });
  }
);
