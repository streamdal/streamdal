import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertEquals, assertExists } from "$std/testing/asserts.ts";

import { FormInput, FormInputProps } from "../formInput.tsx";

describe("components/form/FormInput.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("renders correctly with label and placeholder", () => {
    // Initialize data
    const initialData = { user: { name: "John Doe" } };
    let updatedData = { ...initialData };

    // Define setData to update the data
    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormInputProps = {
      name: "user.name",
      data: initialData,
      setData,
      label: "Name",
      placeHolder: "Enter your name",
      errors: null,
      inputClass: "custom-input",
      wrapperClass: "custom-wrapper",
    };

    const { getByLabelText, getByPlaceholderText, container } = render(
      <FormInput {...props} />,
    );

    const input = getByLabelText("Name") as HTMLInputElement;
    assertExists(input, "Input should exist");
    assertEquals(
      input.value,
      "John Doe",
      "Input should have the correct value",
    );
    assertEquals(
      input.getAttribute("placeholder"),
      "Enter your name",
      "Input should have the correct placeholder",
    );

    // Check for additional classes
    assertEquals(
      input.classList.contains("custom-input"),
      true,
      "Input should have the custom input class",
    );
    const wrapper = container.firstChild as HTMLElement;
    assertExists(wrapper, "Wrapper should exist");
    assertEquals(
      wrapper.classList.contains("custom-wrapper"),
      true,
      "Wrapper should have the custom wrapper class",
    );
  });

  it("renders correctly without label and placeholder", () => {
    // Initialize data
    const initialData = { user: { email: "john.doe@example.com" } };
    let updatedData = { ...initialData };

    // Define setData to update the data
    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormInputProps = {
      name: "user.email",
      data: initialData,
      setData,
      errors: null,
    };

    const { queryByLabelText, queryByPlaceholderText, container } = render(
      <FormInput {...props} />,
    );

    const label = queryByLabelText("Email");
    assertEquals(label, null, "Label should not be rendered");

    const input = container.querySelector(
      "input[name='user.email']",
    ) as HTMLInputElement;
    assertExists(input, "Input should exist");
    assertEquals(
      input.value,
      "john.doe@example.com",
      "Input should have the correct value",
    );
    assertEquals(
      input.getAttribute("placeholder"),
      null,
      "Input should not have a placeholder",
    );
  });

  it("displays error message and applies error styling", () => {
    // Initialize data
    const initialData = { user: { password: "" } };
    let updatedData = { ...initialData };

    // Define setData to update the data
    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormInputProps = {
      name: "user.password",
      data: initialData,
      setData,
      label: "Password",
      errors: { "user.password": "Password is required" },
    };

    const { getByLabelText, getByText } = render(<FormInput {...props} />);

    const input = getByLabelText("Password") as HTMLInputElement;
    assertExists(input, "Input should exist");
    assertEquals(input.value, "", "Input should have the correct value");

    // Check for error message
    const errorMessage = getByText("Password is required");
    assertExists(errorMessage, "Error message should be displayed");

    // Check for error styling
    assertEquals(
      input.classList.contains("border-streamdalRed"),
      true,
      "Input should have the error border class",
    );
  });

  it("applies additional input and wrapper classes", () => {
    // Initialize data
    const initialData = { user: { firstName: "Jane" } };
    let updatedData = { ...initialData };

    // Define setData to update the data
    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormInputProps = {
      name: "user.firstName",
      data: initialData,
      setData,
      label: "First Name",
      inputClass: "bg-gray-100",
      wrapperClass: "mb-4",
      errors: null,
    };

    const { getByLabelText, container } = render(<FormInput {...props} />);

    const input = getByLabelText("First Name") as HTMLInputElement;
    assertExists(input, "Input should exist");
    assertEquals(
      input.classList.contains("bg-gray-100"),
      true,
      "Input should have the additional input class",
    );

    const wrapper = container.firstChild as HTMLElement;
    assertExists(wrapper, "Wrapper should exist");
    assertEquals(
      wrapper.classList.contains("mb-4"),
      true,
      "Wrapper should have the additional wrapper class",
    );
  });

  it("updates the input size based on the value length", () => {
    // Initialize data
    const initialData = { user: { bio: "Hello, I'm John!" } };
    let updatedData = { ...initialData };

    // Define setData to update the data
    const setData = (data: any) => {
      updatedData = data;
    };

    const props: FormInputProps = {
      name: "user.bio",
      data: initialData,
      setData,
      label: "Bio",
      errors: null,
    };

    const { getByLabelText } = render(<FormInput {...props} />);

    const input = getByLabelText("Bio") as HTMLInputElement;
    assertExists(input, "Input should exist");
    assertEquals(
      input.value,
      "Hello, I'm John!",
      "Input should have the correct value",
    );
    assertEquals(
      input.getAttribute("size"),
      "16",
      "Input size should match the value length",
    );
  });
});
