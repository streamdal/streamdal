// notifications.test.tsx

import {
  cleanup,
  fireEvent,
  render,
  setup,
  act,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assert, assertExists, assertEquals } from "$std/testing/asserts.ts";
import Notifications from "../notifications.tsx"; // Adjust the import path as necessary
import {
  NotificationConfig,
  NotificationType,
} from "streamdal-protos/protos/sp_notify.ts";

describe("components/notifications/notifications.tsx", () => {
  beforeAll(setup);

  afterEach(() => {
    cleanup();
    // Reset any global state or mocks here if necessary
  });

  /**
   * Test Case 1: Rendering with Existing Notifications
   */
  it("renders a list of existing notifications", async () => {
    const existingNotifications: NotificationConfig[] = [
      {
        id: "notif-1",
        name: "Slack Notification",
        type: NotificationType.SLACK,
        config: {
          oneofKind: "slack",
          slack: {
            botToken: "xoxb-1234567890",
            channel: "#general",
          },
        },
      },
    ];

    // Render the Notifications component with existing notifications
    const { findByText, getAllByText } = render(
      <Notifications notifications={existingNotifications} />
    );

    // Assert that each notification name is rendered
    for (const notif of existingNotifications) {
      const notifName = await findByText(notif.name);
      assertExists(notifName);
    }

    // Optionally, assert that the correct number of notifications are rendered
    const notificationElements = getAllByText(/Notification$/);
    assertEquals(notificationElements.length, existingNotifications.length);
  });

  /**
   * Test Case 2: Selecting a Notification
   */
  it("selects a notification and displays its details", async () => {
    const existingNotifications: NotificationConfig[] = [
      {
        id: "notif-1",
        name: "Slack Notification",
        type: NotificationType.SLACK,
        config: {
          oneofKind: "slack",
          slack: {
            botToken: "xoxb-1234567890",
            channel: "#general",
          },
        },
      },
    ];

    // Render the Notifications component with existing notifications
    const { findByText, getByText } = render(
      <Notifications notifications={existingNotifications} />
    );

    // Assert that the notification name is rendered
    const notifName = await findByText("Slack Notification");
    assertExists(notifName);

    // Click on the notification to select it
    await act(async () => {
      fireEvent.click(notifName);
    });

    // Assert that the NotificationDetail displays the correct information
    const notifDetail = getByText(/Slack Notification/i);
    assertExists(notifDetail);
  });
});
