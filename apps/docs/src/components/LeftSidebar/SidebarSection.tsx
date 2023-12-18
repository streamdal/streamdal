import "./TabGroup.css";
import type { LeafNode, MenuItem } from "~/config";
import { removeSubpageSegment } from "~/util";

export interface Props {
  type: "learn" | "api";
  defaultActiveTab: "learn" | "api";
  section: MenuItem;
  currentPageMatch: string;
  top?: boolean;
}

const SidebarItem = ({
  item,
  currentPageMatch,
}: {
  item: LeafNode;
  currentPageMatch: string;
}) => (
  <li className="nav-link">
    <a
      href={`/${item.link}/`}
      aria-current={`${
        currentPageMatch.slice(0, -1).endsWith(item.link) ? "page" : "false"
      }`}
      data-current-parent={`${
        removeSubpageSegment(currentPageMatch).endsWith(
          removeSubpageSegment(item.slug)
        )
          ? "true"
          : "false"
      }`}
    >
      {item.text}
      {item.isFallback && <sup class="fallback">EN</sup>}
    </a>
  </li>
);

const navOpen = (section: MenuItem, currentPageMatch: string): boolean =>
  "link" in section
    ? currentPageMatch.includes(section.link)
    : section.children.some((s) => navOpen(s, currentPageMatch));

const SidebarSection = ({
  type,
  defaultActiveTab,
  section,
  currentPageMatch,
  top = false,
}: Props) => {
  return "children" in section ? (
    <li
      className={`nav-group ${top ? "nav-group-top" : ""} ${type} ${
        defaultActiveTab === type ? "active" : ""
      }`}
    >
      <details open={top}>
        <summary class={`nav-group-title ${top ? "nav-group-title-top" : ""}`}>
          <h2>
            {section.text}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 1 16 16"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
              ></path>
            </svg>
          </h2>
        </summary>
        <ul style={{ paddingLeft: "5px" }}>
          {section.children.map((s) => (
            <SidebarSection
              type={type}
              defaultActiveTab={defaultActiveTab}
              section={s}
              currentPageMatch={currentPageMatch}
              top={navOpen(s, currentPageMatch)}
            />
          ))}
        </ul>
      </details>
    </li>
  ) : (
    <SidebarItem item={section} currentPageMatch={currentPageMatch} />
  );
};

export default SidebarSection;
