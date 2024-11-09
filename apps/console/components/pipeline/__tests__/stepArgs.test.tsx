import {
  cleanup,
  fireEvent,
  render,
  setup,
} from "$fresh-testing-library/components.ts";
import { afterEach, beforeAll, describe, it } from "$std/testing/bdd.ts";
import { assertEquals, assertExists } from "$std/testing/asserts.ts";

import { ErrorType } from "../../form/validate.ts";
import { DetectiveType } from "streamdal-protos/protos/steps/sp_steps_detective.ts";
import { nArgTypes, oneArgTypes } from "root/components/pipeline/pipeline.ts";
import { StepArg, StepArgs } from "../stepArgs.tsx";

// Mock data and utilities
const mockSetData = (data: any) => {
  /* Mock implementation */
};
const mockErrors: ErrorType = {};

// Extract valid type keys from DetectiveType for testing
const validTypes = Object.keys(DetectiveType) as Array<
  keyof typeof DetectiveType
>;

describe("components/steps/StepArgs.tsx", () => {
  beforeAll(setup);
  afterEach(cleanup);

  const defaultProps = {
    stepIndex: 0,
    type: "IS_TYPE" as keyof typeof DetectiveType, // Use a valid type key
    data: {
      steps: [
        {
          step: {
            oneofKind: "someKind",
            someKind: {
              args: ["arg1", "arg2"],
            },
          },
        },
      ],
    },
    setData: mockSetData,
    errors: mockErrors,
  };

  it("does not render remove buttons when there is only one arg", () => {
    const singleArgData = {
      steps: [
        {
          step: {
            oneofKind: "someKind",
            someKind: {
              args: ["onlyArg"],
            },
          },
        },
      ],
    };
    // Select a multi-arg type
    const multiArgType = nArgTypes[0] as keyof typeof DetectiveType;
    const props = { ...defaultProps, data: singleArgData, type: multiArgType };
    const { queryByRole } = render(<StepArgs {...props} />);

    const removeButton = queryByRole("button", { name: /trash/i });
    assertEquals(removeButton, null);
  });

  it("handles 'IS_TYPE' selection changes", async () => {
    const props = {
      ...defaultProps,
      type: "IS_TYPE" as keyof typeof DetectiveType,
    };
    const { getByLabelText } = render(<StepArgs {...props} />);

    const select = getByLabelText("Type") as HTMLSelectElement;
    assertExists(select);

    await fireEvent.change(select, { target: { value: "number" } });
    assertEquals(select.value, "number");
    // You can add more assertions to verify setData was called with correct values
  });
});
