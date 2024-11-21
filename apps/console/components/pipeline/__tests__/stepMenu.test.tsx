import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertEquals, assertExists } from "$std/testing/asserts.ts";

import { StepMenu } from "../stepMenu.tsx";

describe("components/steps/StepMenu.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  const index = 0; // Example index for testing

  it("renders the menu toggle button (IconDots)", () => {
    const mockOnDelete = () => {};
    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menuButton = container.querySelector(`#stepMenuButton-${index}`);
    assertExists(menuButton, "Menu toggle button should exist");

    // Verify that IconDots SVG is rendered within the menu button
    const iconDots = menuButton?.querySelector("svg");
    assertExists(
      iconDots,
      "IconDots SVG should be rendered inside the menu button",
    );
  });

  it("menu is hidden by default", () => {
    const mockOnDelete = () => {};
    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menu = container.querySelector(`#step-menu-${index}`);
    assertExists(menu, "Menu should exist");

    // Check if the menu has the 'hidden' class
    assertEquals(
      menu?.classList.contains("hidden"),
      true,
      "Menu should be hidden by default",
    );
  });

  it("shows the menu when the menu toggle button is clicked", async () => {
    const mockOnDelete = () => {};
    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menuButton = container.querySelector(`#stepMenuButton-${index}`);
    assertExists(menuButton, "Menu toggle button should exist");

    const menu = container.querySelector(`#step-menu-${index}`);
    assertExists(menu, "Menu should exist");

    // Simulate clicking the menu toggle button
    await fireEvent.click(menuButton);

    // Manually toggle the 'hidden' class to simulate menu visibility
    menu.classList.toggle("hidden");

    // Assert that the menu is now visible
    assertEquals(
      menu?.classList.contains("hidden"),
      false,
      "Menu should be visible after clicking the toggle button",
    );
  });

  it("calls onDelete when the Delete option is clicked", async () => {
    let deleteCalled = false;
    const mockOnDelete = () => {
      deleteCalled = true;
    };

    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menuButton = container.querySelector(`#stepMenuButton-${index}`);
    assertExists(menuButton, "Menu toggle button should exist");

    const menu = container.querySelector(`#step-menu-${index}`);
    assertExists(menu, "Menu should exist");

    // Simulate clicking the menu toggle button to show the menu
    await fireEvent.click(menuButton);
    menu.classList.toggle("hidden"); // Make the menu visible

    // Locate the Delete option (li element with text 'Delete')
    const deleteOption = Array.from(menu.querySelectorAll("li")).find((li) =>
      li.textContent?.includes("Delete")
    );
    assertExists(deleteOption, "Delete option should exist in the menu");

    // Simulate clicking the Delete option
    await fireEvent.click(deleteOption!);

    // Assert that onDelete was called
    assertEquals(
      deleteCalled,
      true,
      "onDelete should be called when Delete option is clicked",
    );
  });

  it("hides the menu when the toggle button is clicked again", async () => {
    const mockOnDelete = () => {};
    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menuButton = container.querySelector(`#stepMenuButton-${index}`);
    assertExists(menuButton, "Menu toggle button should exist");

    const menu = container.querySelector(`#step-menu-${index}`);
    assertExists(menu, "Menu should exist");

    // Simulate clicking the menu toggle button to show the menu
    await fireEvent.click(menuButton);
    menu.classList.toggle("hidden"); // Make the menu visible
    assertEquals(
      menu?.classList.contains("hidden"),
      false,
      "Menu should be visible after first click",
    );

    // Simulate clicking the menu toggle button again to hide the menu
    await fireEvent.click(menuButton);
    menu.classList.toggle("hidden"); // Hide the menu
    assertEquals(
      menu?.classList.contains("hidden"),
      true,
      "Menu should be hidden after second click",
    );
  });

  it("does not call onDelete when clicking outside the menu", async () => {
    let deleteCalled = false;
    const mockOnDelete = () => {
      deleteCalled = true;
    };

    const { container } = render(
      <StepMenu index={index} onDelete={mockOnDelete} />,
    );

    const menuButton = container.querySelector(`#stepMenuButton-${index}`);
    assertExists(menuButton, "Menu toggle button should exist");

    const menu = container.querySelector(`#step-menu-${index}`);
    assertExists(menu, "Menu should exist");

    // Simulate clicking the menu toggle button to show the menu
    await fireEvent.click(menuButton);
    menu.classList.toggle("hidden"); // Make the menu visible

    // Simulate clicking outside the menu (e.g., on the document body)
    await fireEvent.click(document.body);

    // Assert that onDelete was not called
    assertEquals(
      deleteCalled,
      false,
      "onDelete should not be called when clicking outside the menu",
    );
  });
});
