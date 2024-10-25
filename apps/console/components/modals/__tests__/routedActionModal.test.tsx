import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertExists, assertEquals } from "$std/testing/asserts.ts";
import { RoutedActionModal } from "../routedActionModal.tsx";

describe("components/modals/routedActionModal.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("should render the provided message when message is provided", () => {
    const customMessage = "Are you sure you want to proceed?";
    const { getByText } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message={customMessage}
        actionText="Confirm"
        cancelUrl="/cancel"
      />
    );

    const messageElement = getByText(customMessage);
    assertExists(messageElement);
    assertEquals(messageElement.textContent?.trim(), customMessage);
  });

  it("should render the provided icon", () => {
    const { container } = render(
      <RoutedActionModal
        icon={<svg data-testid="custom-icon"></svg>}
        message="Are you sure you want to proceed?"
        actionText="Confirm"
        cancelUrl="/cancel"
      />
    );

    const iconElement = container.querySelector('[data-testid="custom-icon"]');
    assertExists(iconElement);
  });

  it("should have an action button with correct text and class when destructive is false", () => {
    const { getByText } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message="Are you sure you want to proceed?"
        actionText="Confirm"
        cancelUrl="/cancel"
      />
    );

    const actionButton = getByText("Confirm") as HTMLButtonElement;
    assertExists(actionButton);
    assertEquals(actionButton.tagName, "BUTTON");
    assertEquals(actionButton.className, "btn-heimdal");
    assertEquals(actionButton.getAttribute("type"), "submit");
  });

  it("should have an action button with correct text and class when destructive is true", () => {
    const { getByText } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message="Are you sure you want to delete?"
        actionText="Delete"
        cancelUrl="/cancel"
        destructive={true}
      />
    );

    const actionButton = getByText("Delete") as HTMLButtonElement;
    assertExists(actionButton);
    assertEquals(actionButton.tagName, "BUTTON");
    assertEquals(actionButton.className, "btn-delete");
    assertEquals(actionButton.getAttribute("type"), "submit");
  });

  it("should have a cancel link pointing to the correct cancelUrl", () => {
    const cancelUrl = "/custom-cancel";
    const { getAllByText } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message="Are you sure you want to proceed?"
        actionText="Confirm"
        cancelUrl={cancelUrl}
      />
    );

    const cancelButtons = getAllByText("Cancel") as HTMLButtonElement[];
    cancelButtons.forEach((button) => {
      const parentLink = button.closest("a") as HTMLAnchorElement;
      assertExists(parentLink);
      assertEquals(parentLink.getAttribute("href"), cancelUrl);
    });
  });

  it("should have a close button pointing to the correct cancelUrl", () => {
    const cancelUrl = "/custom-cancel";
    const { container } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message="Are you sure you want to proceed?"
        actionText="Confirm"
        cancelUrl={cancelUrl}
      />
    );

    const closeButton = container.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;
    assertExists(closeButton);
    const parentLink = closeButton.closest("a") as HTMLAnchorElement;
    assertExists(parentLink);
    assertEquals(parentLink.getAttribute("href"), cancelUrl);
  });

  it("should have a form with method POST", () => {
    const { container } = render(
      <RoutedActionModal
        icon={<div>Icon</div>}
        message="Are you sure you want to proceed?"
        actionText="Confirm"
        cancelUrl="/cancel"
      />
    );

    const formElement = container.querySelector("form") as HTMLFormElement;
    assertExists(formElement);
    assertEquals(formElement.getAttribute("method"), "POST");
  });
});
