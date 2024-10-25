import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertExists, assertEquals, assert } from "$std/testing/asserts.ts";
import { HeadersType, Headers } from "../headers.tsx";

describe("components/pipeline/headers.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  const defaultProps: HeadersType = {
    name: "testHeaders",
    data: { testHeaders: { "Content-Type": "application/json" } },
    errors: {},
  };

  /**
   * TODO: uncomment those tests when id + htmlfor issue with headers is fixed
   */
  //   it("allows adding a new header", async () => {
  //     const { getByRole, getAllByLabelText } = render(
  //       <Headers {...defaultProps} />
  //     );

  //     const addButton =
  //       getByRole("button", { name: /add/i }) ||
  //       getAllByLabelText("Add headers")[0];
  //     await fireEvent.click(addButton);

  //     const keyInputs = getAllByLabelText("Key") as HTMLInputElement[];
  //     const valueInputs = getAllByLabelText("Value") as HTMLInputElement[];

  //     assertEquals(keyInputs.length, 2);
  //     assertEquals(valueInputs.length, 2);
  //     assertEquals(keyInputs[1].value, "");
  //     assertEquals(valueInputs[1].value, "");
  //   });

  //   it("allows removing a header", async () => {
  //     const { getAllByRole, getAllByLabelText } = render(
  //       <Headers {...defaultProps} />
  //     );

  //     // Add a second header first
  //     const addButtons = getAllByLabelText("Add headers");
  //     await fireEvent.click(addButtons[0]);

  //     let keyInputs = getAllByLabelText("Key") as HTMLInputElement[];
  //     let valueInputs = getAllByLabelText("Value") as HTMLInputElement[];

  //     assertEquals(keyInputs.length, 2);
  //     assertEquals(valueInputs.length, 2);

  //     // Now remove the second header
  //     const removeButtons = getAllByRole("button", { name: /trash/i });
  //     await fireEvent.click(removeButtons[1]);

  //     keyInputs = getAllByLabelText("Key") as HTMLInputElement[];
  //     valueInputs = getAllByLabelText("Value") as HTMLInputElement[];

  //     assertEquals(keyInputs.length, 1);
  //     assertEquals(valueInputs.length, 1);
  //   });

  //   it("updates the key of a header", async () => {
  //     const { getByLabelText } = render(<Headers {...defaultProps} />);

  //     const keyInput = getByLabelText("Key") as HTMLInputElement;
  //     await fireEvent.input(keyInput, { target: { value: "Authorization" } });

  //     assertEquals(keyInput.value, "Authorization");
  //   });

  //   it("updates the value of a header", async () => {
  //     const { getByLabelText } = render(<Headers {...defaultProps} />);

  //     const valueInput = getByLabelText("Value") as HTMLInputElement;
  //     await fireEvent.input(valueInput, { target: { value: "Bearer token" } });

  //     assertEquals(valueInput.value, "Bearer token");
  //   });

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
      "enter key first"
    ) as HTMLInputElement;
    assertExists(valueInput);
    assert(valueInput.disabled);
  });
});
