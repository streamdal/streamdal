import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertExists, assertEquals } from "$std/testing/asserts.ts";
import { InternalError } from "../internal.tsx";

describe("components/error/internal.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  it("should display default error message when no message is provided", () => {
    const { getByText } = render(<InternalError />);
    const defaultMessage = getByText(
      "There was a problem completing the operation. Please try again later"
    );
    assertExists(defaultMessage);
    assertEquals(
      defaultMessage.textContent?.trim(),
      "There was a problem completing the operation. Please try again later"
    );
  });

  it("should display custom error message when message is provided", () => {
    const customMessage = "Custom internal error message.";
    const { getByText } = render(<InternalError message={customMessage} />);
    const customMessageElement = getByText(customMessage);
    assertExists(customMessageElement);
    assertEquals(customMessageElement.textContent?.trim(), customMessage);
  });

  it('should have a "reloading" link pointing to "/"', () => {
    const { getByText } = render(<InternalError />);
    const reloadLink = getByText("reloading") as HTMLAnchorElement;
    assertExists(reloadLink);
    assertEquals(reloadLink.tagName, "A");
    assertEquals(reloadLink.getAttribute("href"), "/");
  });

  it('should have a "here" link pointing to "https://github.com/streamdal/streamdal"', () => {
    const { getByText } = render(<InternalError />);
    const hereLink = getByText("here") as HTMLAnchorElement;
    assertExists(hereLink);
    assertEquals(hereLink.tagName, "A");
    assertEquals(
      hereLink.getAttribute("href"),
      "https://github.com/streamdal/streamdal"
    );
    assertEquals(hereLink.getAttribute("target"), "_new"); // Verify target attribute
  });

  it("should display the error image with correct src", () => {
    const { container } = render(<InternalError />);
    const imgElement = container.querySelector("img");
    assertExists(imgElement);
    assertEquals(imgElement?.getAttribute("src"), "/images/error.png");
  });
});
