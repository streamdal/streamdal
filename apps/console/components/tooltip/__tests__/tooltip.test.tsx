import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertExists, assertEquals, assert } from "$std/testing/asserts.ts";
import { Tooltip } from "../tooltip.tsx";

describe("components/tooltip/tooltip.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("renders the Tooltip with given targetId and message", () => {
    const props = {
      targetId: "test-tooltip",
      message: "This is a tooltip message.",
    };

    const { getByRole } = render(<Tooltip {...props} />);

    const tooltip = getByRole("tooltip");
    assertExists(tooltip);
    assertEquals(tooltip.id, "test-tooltip");
    assertEquals(tooltip.textContent, "This is a tooltip message.");
  });

  it("handles multi-line messages correctly", () => {
    const props = {
      targetId: "multi-line-tooltip",
      message: "Line one.\nLine two.\nLine three.",
    };

    const { getByRole, getAllByText } = render(<Tooltip {...props} />);

    const tooltip = getByRole("tooltip");
    assertExists(tooltip);

    const lines = getAllByText(/Line (one|two|three)\./);
    assertEquals(lines.length, 3);
    assertEquals(lines[0].textContent, "Line one.");
    assertEquals(lines[1].textContent, "Line two.");
    assertEquals(lines[2].textContent, "Line three.");
  });

  it("includes the tooltip arrow in the rendered output", () => {
    const props = {
      targetId: "arrow-tooltip",
      message: "Tooltip with arrow.",
    };

    const { getByRole, container } = render(<Tooltip {...props} />);

    const tooltip = getByRole("tooltip");
    assertExists(tooltip);

    const arrow = container.querySelector(".tooltip-arrow");
    assertExists(arrow);
  });

  it("handles empty message gracefully", () => {
    const props = {
      targetId: "empty-message-tooltip",
      message: "",
    };

    const { getByRole, container } = render(<Tooltip {...props} />);

    const tooltip = getByRole("tooltip");
    assertExists(tooltip);
    assertEquals(tooltip.textContent, "\u00A0"); // &nbsp; is rendered as a non-breaking space
    const lines = tooltip.querySelectorAll("div > div");
    assertEquals(lines.length, 2);
    assertEquals(lines[0].innerHTML, "&nbsp;");
  });
});
