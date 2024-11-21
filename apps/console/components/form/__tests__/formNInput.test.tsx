// File: FormNInput.test.tsx

import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertEquals, assertExists } from "$std/testing/asserts.ts";

import { FormNInput, FormNInputProps } from "../formNInput.tsx"; // Adjust the import path accordingly
import { ErrorType } from "../validate.ts"; // Adjust the import path accordingly

// Define a helper function to create a spy for setData
const createSetDataSpy = (initialData: any) => {
  let data = initialData;
  const calls: any[] = [];
  const setData = (newData: any) => {
    data = newData;
    calls.push(newData);
  };
  return { setData, getCalls: () => calls, getData: () => data };
};

describe("components/form/FormNInput.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("renders correctly with initial inputs", () => {
    const initialData = { user: { hobbies: ["Reading", "Gaming"] } };
    const initialErrors: ErrorType = {};

    const { setData, getCalls, getData } = createSetDataSpy(initialData);

    const props: FormNInputProps = {
      name: "user.hobbies",
      data: initialData,
      setData: setData,
      label: "Hobby",
      placeHolder: "Enter a hobby",
      errors: initialErrors,
    };

    const { getAllByLabelText } = render(<FormNInput {...props} />);

    // Verify that each hobby input is rendered with correct value
    const inputs = getAllByLabelText("Hobby") as HTMLInputElement[];
    assertEquals(
      inputs.length,
      2,
      "There should be two Hobby inputs initially",
    );
    assertEquals(
      inputs[0].value,
      "Reading",
      "First Hobby input should have value 'Reading'",
    );
    assertEquals(
      inputs[1].value,
      "Gaming",
      "Second Hobby input should have value 'Gaming'",
    );
  });

  it("renders correctly with a single input when initial hobbies are empty", () => {
    const initialData = { user: { hobbies: [] } };
    const initialErrors: ErrorType = {};

    const { setData, getCalls, getData } = createSetDataSpy(initialData);

    const props: FormNInputProps = {
      name: "user.hobbies",
      data: initialData,
      setData: setData,
      label: "Hobby",
      placeHolder: "Enter a hobby",
      errors: initialErrors,
    };

    const { getAllByLabelText } = render(<FormNInput {...props} />);

    // Verify that at least one hobby input is rendered
    const inputs = getAllByLabelText("Hobby") as HTMLInputElement[];
    assertEquals(
      inputs.length,
      1,
      "There should be one Hobby input when hobbies are empty",
    );
    assertEquals(inputs[0].value, "", "Hobby input should be empty");
  });

  it("displays error messages correctly", () => {
    const initialData = { user: { hobbies: ["Reading", "Gaming"] } };
    const initialErrors: ErrorType = {
      "user.hobbies.1": "Gaming is not allowed",
    };

    let updatedData = { ...initialData };

    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormNInputProps = {
      name: "user.hobbies",
      data: initialData,
      setData: setData,
      label: "Hobby",
      placeHolder: "Enter a hobby",
      errors: initialErrors,
    };

    const { getAllByLabelText, getByText } = render(<FormNInput {...props} />);

    const inputs = getAllByLabelText("Hobby") as HTMLInputElement[];
    assertEquals(
      inputs.length,
      2,
      "There should be two Hobby inputs initially",
    );

    // Verify that the second input has an error message
    const errorMessage = getByText("Gaming is not allowed");
    assertExists(
      errorMessage,
      "Error message should be displayed for the second Hobby input",
    );

    // Check for error styling on the second input
    // Assuming that FormInput applies 'border-streamdalRed' class on error
    const secondInput = inputs[1];
    assertEquals(
      secondInput.classList.contains("border-streamdalRed"),
      true,
      "Second Hobby input should have error border styling",
    );
  });

  it("applies additional input and wrapper classes", () => {
    const initialData = { user: { hobbies: ["Reading"] } };
    let updatedData = { ...initialData };

    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormNInputProps = {
      name: "user.hobbies",
      data: initialData,
      setData: setData,
      label: "Hobby",
      placeHolder: "Enter a hobby",
      errors: {},
    };

    const { getAllByLabelText, container } = render(<FormNInput {...props} />);

    const inputs = getAllByLabelText("Hobby") as HTMLInputElement[];
    assertEquals(inputs.length, 1, "There should be one Hobby input initially");
    const input = inputs[0];
    assertExists(input, "Hobby input should exist");

    // Check for additional input class
    assertEquals(
      input.classList.contains("w-full"),
      true,
      "Input should have the 'w-full' class",
    );

    // Check for additional wrapper class
    const wrapper = container.querySelector(
      "div.flex.flex-col.mb-2.border.rounded-sm.px-2.w-full",
    ) as HTMLElement;
    assertExists(wrapper, "Wrapper div should exist");
    assertEquals(
      wrapper.classList.contains("w-full"),
      true,
      "Wrapper should have the 'w-full' class",
    );
  });

  it("handles tooltip rendering correctly", () => {
    const initialData = { user: { hobbies: ["Reading"] } };
    const initialErrors: ErrorType = {};

    const { setData, getCalls, getData } = createSetDataSpy(initialData);

    const props: FormNInputProps = {
      name: "user.hobbies",
      data: initialData,
      setData: setData,
      label: "Hobby",
      placeHolder: "Enter a hobby",
      errors: initialErrors,
    };

    const { container } = render(<FormNInput {...props} />);

    // Locate the Add button (IconPlus)
    const addButton = container.querySelector(
      'svg[data-tooltip-target^="input-add-"]',
    );
    assertExists(addButton, "Add button should exist");

    // Verify that the Tooltip exists with the correct message
    const tooltipTargetId = addButton.getAttribute("data-tooltip-target");
    assertExists(
      tooltipTargetId,
      "Add button should have a data-tooltip-target attribute",
    );

    const tooltip = container.querySelector(`#${tooltipTargetId}`);
    assertExists(tooltip, "Tooltip should exist for the Add button");
    assertEquals(
      tooltip.textContent,
      "Add a Hobby",
      "Tooltip should display the correct message",
    );
  });
});
