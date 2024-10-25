import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertExists, assertEquals } from "$std/testing/asserts.ts";

import { TailRateModal } from "../tailRateModal.tsx";
import { opModal } from "../../serviceMap/opModalSignal.ts";
import { tailSamplingSignal } from "../../../components/tail/signals.ts";
// Re-defining opModal and tailSamplingSignal for testing purposes
opModal.value = { tailRateModal: true, clients: 1 };
tailSamplingSignal.value = { rate: 10, intervalSeconds: 5, default: true };

describe("components/modals/tailRateModal.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("should render the modal correctly", () => {
    const { getByText } = render(<TailRateModal />);
    const formTitle = getByText(
      "Rate is the number of messages to sample per the Interval in seconds you specify."
    );
    assertExists(formTitle);
  });

  it("should render the close (IconX) button", () => {
    const { container } = render(<TailRateModal />);
    const closeButton = container.querySelector('button[type="button"]');
    assertExists(closeButton);
    const icon = closeButton?.querySelector("svg");
    assertExists(icon);
  });

  it("should close the modal when the close button is clicked", () => {
    const { container, getByRole } = render(<TailRateModal />);
    const closeButton = container.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;
    assertExists(closeButton);

    // Simulate click on close button
    closeButton.click();

    // Assert that the modal is now hidden
    assertEquals(opModal.value.tailRateModal, false);
  });

  it("should render the cancel button", () => {
    const { getByText } = render(<TailRateModal />);
    const cancelButton = getByText("Cancel");
    assertExists(cancelButton);
  });
});
