import { assertEquals } from "$std/testing/asserts.ts";
import z from "zod/index.ts";
import {
  numeric,
  parsePath,
  resolveValue,
  setValue,
  text,
  updateData,
  validate,
} from "../validate.ts";

const formData = {
  steps: [
    { name: "test-name", attribute: "test-value" },
    {
      name: "another-test-name",
      attribute: "test-value",
      onSuccess: [1, 1],
    },
  ],
};

Deno.test("validate.setValue updates deeply nested property", () => {
  const updatedValue = "updated-value";
  const updated = setValue(formData, ["steps", 1, "attribute"], updatedValue);
  assertEquals(updated.steps[1].attribute, updatedValue);
});

Deno.test(
  "validate.setValue updates deeply nested property with array leaf node",
  () => {
    const notify = 1;
    const updated = setValue(formData, ["steps", 1, "onSuccess", 1], notify);
    assertEquals(updated.steps[1].onSuccess[1], notify);
  }
);

Deno.test(
  "validate.resolveValue resolves deeply nested value by path string",
  () => {
    const value: any = resolveValue(formData, "steps.1.onSuccess.1");
    assertEquals(value, 1);
  }
);

Deno.test(
  "validate.parsePath parses an object notation string path to parts",
  () => {
    const value: any = parsePath("steps.1.onSuccess.1");
    assertEquals(value, ["steps", "1", "onSuccess", "1"]);
  }
);

Deno.test(
  "validate.updateData updates deeply nested property using provided state function ",
  () => {
    let updatedData: any = null;
    const setData = (data: any) => (updatedData = data);
    const updatedValue = "updated-value";
    updateData(formData, setData, ["steps", 1, "attribute"], updatedValue);
    assertEquals(updatedData?.steps[1].attribute, updatedValue);
  }
);

Deno.test("updateData adds new nested property", () => {
  let updatedData: any = null;
  const setData = (data: any) => {
    updatedData = data;
  };
  const initialData = {};
  updateData(initialData, setData, ["x", "y"], "new");
  assertEquals(updatedData, { x: { y: "new" } });
});

Deno.test("updateData updates deep nested property", () => {
  let updatedData: any = null;
  const setData = (data: any) => {
    updatedData = data;
  };
  const initialData = { a: { b: { c: 3 } } };
  updateData(initialData, setData, ["a", "b", "c"], 4);
  assertEquals(updatedData.a.b.c, 4);
});

Deno.test("updateData handles updating array elements", () => {
  let updatedData: any = null;
  const setData = (data: any) => {
    updatedData = data;
  };
  const initialData = { list: ["zero", "one", "two"] };
  updateData(initialData, setData, ["list", 1], "updated");
  assertEquals(updatedData.list[1], "updated");
});

Deno.test("validate captures missing required fields", () => {
  const schema = z.object({
    name: text(),
    age: numeric(),
  });

  const formData = new FormData();
  formData.append("name", "John Doe");
  // Age is missing

  const result = validate(schema, formData);
  assertEquals(result.data, null);
  assertEquals(result.errors, {
    age: "Required",
  });
});
