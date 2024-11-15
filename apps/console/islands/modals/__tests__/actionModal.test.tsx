import {
  cleanup,
  fireEvent,
  render,
  setup,
  act,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assert, assertExists, assertEquals } from "$std/testing/asserts.ts";
import { ActionModal } from "../actionModal.tsx"; // Adjust the import path as necessary

describe("components/actionmodal/ActionModal.tsx", () => {
  beforeAll(setup);

  afterEach(() => {
    cleanup();
  });

  /**
   * Test Case 1: Rendering the ActionModal
   */
  it("renders the ActionModal with provided icon and message", async () => {
    const mockIcon = <span data-testid="mock-icon">Icon</span>;
    const mockMessage = (
      <p data-testid="mock-message">This is a test message.</p>
    );
    const actionText = "Confirm";
    const onAction = () => {};
    const onClose = () => {};

    const { getByTestId, getByText } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
      />
    );

    // Assert that the modal is rendered
    const modal = getByTestId("action-modal");
    assertExists(modal, "ActionModal should be rendered");

    // Assert that the icon is rendered
    const icon = getByTestId("action-modal-icon");
    assertExists(icon, "Icon should be rendered within the modal");

    // Assert that the message is rendered
    const message = getByTestId("action-modal-message");
    assertExists(message, "Message should be rendered within the modal");

    // Assert that the action button is rendered with correct text
    const actionButton = getByTestId("action-modal-action");
    assertExists(actionButton, "Action button should be rendered");
    assertEquals(
      actionButton.textContent,
      actionText,
      "Action button should display correct text"
    );
  });

  /**
   * Test Case 2: Action Button with Destructive Prop
   */
  it("renders the action button with correct class when destructive is true", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = <p>Destructive action message.</p>;
    const actionText = "Delete";
    const onAction = () => {};
    const onClose = () => {};
    const destructive = true;

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
        destructive={destructive}
      />
    );

    const actionButton = getByTestId("action-modal-action");
    assertExists(actionButton, "Action button should be rendered");
    assertEquals(
      actionButton.classList.contains("btn-delete"),
      true,
      "Action button should have class 'btn-delete' when destructive is true"
    );
  });

  /**
   * Test Case 3: Action Button without Destructive Prop
   */
  it("renders the action button with correct class when destructive is false or undefined", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = <p>Non-destructive action message.</p>;
    const actionText = "Confirm";
    const onAction = () => {};
    const onClose = () => {};
    const destructive = false;

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
        destructive={destructive}
      />
    );

    const actionButton = getByTestId("action-modal-action");
    assertExists(actionButton, "Action button should be rendered");
    assertEquals(
      actionButton.classList.contains("btn-heimdal"),
      true,
      "Action button should have class 'btn-heimdal' when destructive is false"
    );
  });

  /**
   * Test Case 4: Clicking the Close Button Triggers onClose
   */
  it("calls onClose when the close button is clicked", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = <p>Click the close button to close the modal.</p>;
    const actionText = "Confirm";
    let onActionCalled = 0;
    let onCloseCalled = 0;
    const onAction = () => {
      onActionCalled += 1;
    };
    const onClose = () => {
      onCloseCalled += 1;
    };

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
      />
    );

    const closeButton = getByTestId("action-modal-close");
    assertExists(closeButton, "Close button should be rendered");

    await act(async () => {
      fireEvent.click(closeButton);
    });

    assertEquals(
      onCloseCalled,
      1,
      "onClose should be called once when close button is clicked"
    );
    assertEquals(
      onActionCalled,
      0,
      "onAction should not be called when close button is clicked"
    );
  });

  /**
   * Test Case 5: Clicking the Cancel Button Triggers onClose
   */
  it("calls onClose when the cancel button is clicked", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = <p>Click the cancel button to close the modal.</p>;
    const actionText = "Confirm";
    let onActionCalled = 0;
    let onCloseCalled = 0;
    const onAction = () => {
      onActionCalled += 1;
    };
    const onClose = () => {
      onCloseCalled += 1;
    };

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
      />
    );

    const cancelButton = getByTestId("action-modal-cancel");
    assertExists(cancelButton, "Cancel button should be rendered");

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    assertEquals(
      onCloseCalled,
      1,
      "onClose should be called once when cancel button is clicked"
    );
    assertEquals(
      onActionCalled,
      0,
      "onAction should not be called when cancel button is clicked"
    );
  });

  /**
   * Test Case 6: Clicking the Action Button Triggers onAction
   */
  it("calls onAction when the action button is clicked", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = (
      <p>Perform the action by clicking the action button.</p>
    );
    const actionText = "Confirm";
    let onActionCalled = 0;
    let onCloseCalled = 0;
    const onAction = () => {
      onActionCalled += 1;
    };
    const onClose = () => {
      onCloseCalled += 1;
    };

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
      />
    );

    const actionButton = getByTestId("action-modal-action");
    assertExists(actionButton, "Action button should be rendered");

    await act(async () => {
      fireEvent.click(actionButton);
    });

    assertEquals(
      onActionCalled,
      1,
      "onAction should be called once when action button is clicked"
    );
    assertEquals(
      onCloseCalled,
      0,
      "onClose should not be called when action button is clicked"
    );
  });

  /**
   * Test Case 7: Rendering without Destructive Prop Defaults to Non-Destructive
   */
  it("renders the action button with 'btn-heimdal' class when destructive prop is not provided", async () => {
    const mockIcon = <span>Icon</span>;
    const mockMessage = <p>Action button without destructive prop.</p>;
    const actionText = "Confirm";
    const onAction = () => {};
    const onClose = () => {};

    const { getByTestId } = render(
      <ActionModal
        icon={mockIcon}
        message={mockMessage}
        actionText={actionText}
        onAction={onAction}
        onClose={onClose}
      />
    );

    const actionButton = getByTestId("action-modal-action");
    assertExists(actionButton, "Action button should be rendered");
    assertEquals(
      actionButton.classList.contains("btn-heimdal"),
      true,
      "Action button should have class 'btn-heimdal' when destructive prop is not provided"
    );
  });
});
