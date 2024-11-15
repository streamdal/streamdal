import {
  cleanup,
  fireEvent,
  render,
  setup,
  act,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assert, assertExists, assertEquals } from "$std/testing/asserts.ts";
import { Toasts, showToast, ToastType, toastsSignal } from "../toasts.tsx";
import { delay } from "$std/async/delay.ts"; // Importing delay from Deno's standard library

describe("components/toasts/toasts.tsx", () => {
  beforeAll(setup);
  afterEach(() => {
    cleanup();
    // Reset the toastsSignal after each test to ensure isolation
    toastsSignal.value = [];
  });

  it("renders a toast when showToast is called", async () => {
    const toast: ToastType = {
      id: "test-toast-1",
      message: "This is a success message.",
      type: "success",
      autoClose: false, // Disable autoClose for this test
    };

    // Render the Toasts component
    const { findByText, getByRole } = render(<Toasts />);

    // Call showToast to add a toast
    await act(async () => {
      showToast(toast);
    });

    // Assert that the toast message is rendered
    const toastMessage = await findByText(toast.message);
    assertExists(toastMessage);
  });

  it("renders a toast when toastsSignal is updated directly", async () => {
    const toast: ToastType = {
      id: "test-toast-2",
      message: "Direct signal update toast.",
      type: "error",
      autoClose: false,
    };

    // Render the Toasts component
    const { findByText } = render(<Toasts />);

    // Directly update the toastsSignal within act
    await act(async () => {
      toastsSignal.value = [...toastsSignal.value, toast];
    });

    // Assert that the toast message is rendered
    const toastMessage = await findByText(toast.message);
    assertExists(toastMessage);
  });

  it("removes a toast when the close button is clicked", async () => {
    const toast: ToastType = {
      id: "test-toast-3",
      message: "This is an error message.",
      type: "error",
      autoClose: false, // Disable autoClose for this test
    };

    // Render the Toasts component
    const { findByText, getByLabelText, queryByText } = render(<Toasts />);

    // Add the toast within act
    await act(async () => {
      showToast(toast);
    });

    // Assert that the toast message is rendered
    const toastMessage = await findByText(toast.message);
    assertExists(toastMessage);

    // Find the close button and click it within act
    const closeButton = getByLabelText("Close");
    assertExists(closeButton);
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Assert that the toast is removed
    const removedToast = queryByText(toast.message);
    assertEquals(removedToast, null);
  });

  it("automatically removes a toast after the timeout when autoClose is true", async () => {
    const toast: ToastType = {
      id: "test-toast-4",
      message: "This toast will auto-close.",
      type: "success",
      autoClose: true, // Enable autoClose
    };

    // Render the Toasts component
    const { findByText } = render(<Toasts />);

    // Add the toast within act
    await act(async () => {
      showToast(toast);
    });

    // Assert that the toast message is rendered
    const toastMessage = await findByText(toast.message);
    assertExists(toastMessage);

    // Wait for 3 seconds to allow autoClose to trigger
    await act(async () => {
      await delay(3000);
    });

    assertEquals(toastsSignal.value.length, 0);
  });

  it("does not add duplicate toasts with the same id", async () => {
    const toast: ToastType = {
      id: "test-toast-5",
      message: "This toast should not duplicate.",
      type: "success",
      autoClose: false,
    };

    // Render the Toasts component
    const { findAllByText } = render(<Toasts />);

    // Add the toast twice within act
    await act(async () => {
      showToast(toast);
      showToast(toast);
    });

    // Assert that only one toast is rendered
    const toasts = await findAllByText(toast.message);
    assertEquals(toasts.length, 1, "Duplicate toast was added");
  });
});
