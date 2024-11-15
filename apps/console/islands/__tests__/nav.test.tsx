// navbar.test.tsx

import {
  act,
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assert, assertEquals, assertExists } from "$std/testing/asserts.ts";
import { NavBar } from "../nav.tsx"; // Adjust the import path as necessary
import { showNav } from "root/components/nav/signals.ts"; // Adjust the import path as necessary

describe("components/navbar/navbar.tsx", () => {
  beforeAll(setup);

  afterEach(() => {
    cleanup();
    // Reset the showNav signal after each test to ensure isolation
    showNav.value = false;
  });

  /**
   * Test Case 1: Rendering the NavBar
   */
  it("renders the NavBar without crashing and the menu is hidden by default", async () => {
    const { queryByTestId } = render(<NavBar />);

    // Assert that the menu is hidden by default
    const navMenu = queryByTestId("nav-menu");
    assert(navMenu, undefined);

    // // Verify that the menu button is present
    const menuButton = queryByTestId("menu-button");
    assertExists(menuButton, "Menu button should be rendered");
  });

  it("toggles the navigation menu visibility when the menu button is clicked", async () => {
    const { getByTestId, queryByTestId } = render(<NavBar />);

    const menuButton = getByTestId("menu-button");
    assertExists(menuButton, "Menu button should be rendered");

    // Initially, the navigation menu should be hidden
    let navMenu = queryByTestId("nav-menu");
    assert(navMenu, undefined);

    // Click the menu button to open the navigation menu
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Now, the navigation menu should be visible
    navMenu = getByTestId("nav-menu");
    assertExists(
      navMenu,
      "Navigation menu should be visible after clicking the menu button",
    );

    // Click the menu button again to close the navigation menu
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // The navigation menu should be hidden again
    navMenu = queryByTestId("nav-menu");
    assert(navMenu, undefined);
  });
});
