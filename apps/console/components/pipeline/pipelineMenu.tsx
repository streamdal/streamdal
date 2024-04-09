import IconCopy from "tabler-icons/tsx/copy.tsx";
import IconDots from "tabler-icons/tsx/dots.tsx";
import IconTrash from "tabler-icons/tsx/trash.tsx";
import { useEffect, useRef, useState } from "preact/hooks";

export const PipelineMenu = ({ id }: { id?: string }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickAway = (event: any) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickAway);
    return () => {
      document.removeEventListener("mousedown", clickAway);
    };
  }, [menuRef]);

  return (
    <div
      ref={menuRef}
      type="button"
      className="cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <IconDots class="w-6 h-6 ml text-lunar cursor-pointer" />
      {open && (
        <div
          id="pipeline-menu"
          class="z-40 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
        >
          <ul class="py-2 text-sm text-gray-700">
            <li className="flex flex-start items-center px-2 py-2 hover:bg-sunset text-sm cursor-not-allowed">
              <IconCopy class="w-4 h-4 mr-2" />
              Duplicate Pipeline
            </li>
            <a href={id ? `/pipelines/${id}/delete` : "/pipelines"}>
              <li className="cursor-pointer group flex w-full items-center py-2 px-2 text-eyelid hover:text-white hover:bg-eyelid text-sm">
                <IconTrash class="w-4 h-4 mr-2 text-eyelid group-hover:text-white" />
                Delete
              </li>
            </a>
          </ul>
        </div>
      )}
    </div>
  );
};
