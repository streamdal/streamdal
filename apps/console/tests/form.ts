import { assertEquals } from "$std/testing/asserts.ts";
import {
  parsePath,
  resolveValue,
  setValue,
  updateData,
} from "../components/form/validate.ts";

const formData = {
  steps: [{ name: "test-name", attribute: "test-value" }, {
    name: "another-test-name",
    attribute: "test-value",
    onSuccess: [1, 1],
  }],
};

Deno.test("validate.setValue updates deeply nested property", () => {
  const updatedValue = "updated-value";
  const updated = setValue(
    formData,
    ["steps", 1, "attribute"],
    updatedValue,
  );
  assertEquals(updated.steps[1].attribute, updatedValue);
});

Deno.test("validate.setValue updates deeply nested property with array leaf node", () => {
  const notify = 1;
  const updated = setValue(
    formData,
    ["steps", 1, "onSuccess", 1],
    notify,
  );
  assertEquals(updated.steps[1].onSuccess[1], notify);
});

Deno.test("validate.resolveValue resolves deeply nested value by path string", () => {
  const value: any = resolveValue(
    formData,
    "steps.1.onSuccess.1",
  );
  assertEquals(value, 1);
});

Deno.test("validate.parsePath parses an object notation string path to parts", () => {
  const value: any = parsePath(
    "steps.1.onSuccess.1",
  );
  assertEquals(value, ["steps", "1", "onSuccess", "1"]);
});

Deno.test("validate.updateData updates deeply nested property using provided state function ", () => {
  let updatedData: any = null;
  const setData = (data: any) => updatedData = data;
  const updatedValue = "updated-value";
  updateData(
    formData,
    setData,
    ["steps", 1, "attribute"],
    updatedValue,
  );
  assertEquals(updatedData?.steps[1].attribute, updatedValue);
});
