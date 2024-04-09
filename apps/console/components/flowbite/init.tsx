//
// Utility to force re-init flowbite. A last resort when
// flowbite runs into problems with some fresh rendering scenarios.
export const initFlowBite = async () => {
  const { initFlowbite } = await import("flowbite");
  initFlowbite();
};
