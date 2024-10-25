import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assert, assertEquals, assertExists } from "$std/testing/asserts.ts";
import { Headers, HeadersType } from "../headers.tsx";

describe("components/pipeline/headers.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  const defaultProps: HeadersType = {
    name: "testHeaders",
    data: { testHeaders: { "Content-Type": "application/json" } },
    errors: {},
  };

  it("displays error message when there is an error", () => {
    const errorProps: HeadersType = {
      ...defaultProps,
      errors: { "testHeaders.Content-Type": "Invalid header value" },
    };

    const { getByText } = render(<Headers {...errorProps} />);

    const errorMessage = getByText("Invalid header value");
    assertExists(errorMessage);
  });

  it("disables the value input when the key is empty", () => {
    const emptyKeyProps: HeadersType = {
      name: "emptyKeyHeaders",
      data: { emptyKeyHeaders: { "": "some value" } },
      errors: {},
    };

    const { getByPlaceholderText } = render(<Headers {...emptyKeyProps} />);

    const valueInput = getByPlaceholderText(
      "enter key first",
    ) as HTMLInputElement;
    assertExists(valueInput);
    assert(valueInput.disabled);
  });
});
