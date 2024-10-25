import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertEquals, assertExists } from "$std/testing/asserts.ts";
import { CustomError } from "../custom.tsx";

describe("components/error/custom.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("should render default error message when no children are provided", () => {
    const { getByText } = render(<CustomError />);
    const defaultMessage = getByText(
      `"There was a problem completing the operation. Please try again later"`,
    );
    assertExists(defaultMessage);
    assertEquals(
      defaultMessage.textContent?.trim(),
      `"There was a problem completing the operation. Please try again later"`,
    );
  });

  it("should render custom error message when children are provided", () => {
    const customMessageText = "This is a custom error message.";
    const { getByText } = render(
      <CustomError>{customMessageText}</CustomError>,
    );
    const customMessage = getByText(customMessageText);
    assertExists(customMessage);
    assertEquals(customMessage.textContent?.trim(), customMessageText);
  });

  it('should have a reload link pointing to "/"', () => {
    const { getByText } = render(<CustomError />);
    const reloadLink = getByText("reloading") as HTMLAnchorElement;
    assertExists(reloadLink);
    assertEquals(reloadLink.tagName, "A");
    assertEquals(reloadLink.getAttribute("href"), "/");
  });
});
