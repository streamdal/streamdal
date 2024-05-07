export const Tooltip = (
  { targetId, message }: { targetId: string; message: string },
) => (
  <div
    id={targetId}
    role="tooltip"
    class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip"
  >
    {message.split("\n").map((line, index) => (
      <div key={index}>{line === "" ? <>&nbsp;</> : line}</div>
    ))}
    <div class="tooltip-arrow" data-popper-arrow></div>
  </div>
);
