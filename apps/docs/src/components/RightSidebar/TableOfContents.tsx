import type { FunctionalComponent } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import type { MarkdownHeading } from "astro";

type ItemOffsets = {
  id: string;
  topOffset: number;
};

export const overview = { depth: 2, slug: "overview", text: "Overview" };

const TableOfContents: FunctionalComponent<{ headings: MarkdownHeading[] }> = ({
  headings = [],
}) => {
  const itemOffsets = useRef<ItemOffsets[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const getItemOffsets = () => {
      const titles = document.querySelectorAll("article :is(h1, h2, h3, h4)");
      itemOffsets.current = Array.from(titles).map((title) => ({
        id: title.id,
        topOffset: title.getBoundingClientRect().top + window.scrollY,
      }));
    };

    getItemOffsets();
    window.addEventListener("resize", getItemOffsets);

    return () => {
      window.removeEventListener("resize", getItemOffsets);
    };
  }, []);

  useEffect(() => {
    const handleObsever = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry?.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObsever, {
      rootMargin: "-10% 0px -65% 0px",
    });

    const elements = document.querySelectorAll("article :is(h1,h2,h3)");
    elements.forEach((elem) => observer?.current?.observe(elem));
    return () => observer.current?.disconnect();
  });

  return (
    <div>
      <h2 className="heading">On this page</h2>
      <ul>
        {[...[overview], ...headings]
          .filter(({ depth }) => depth > 1 && depth < 4)
          .map((heading) => {
            return (
              <li
                class={`list-none pt-1 pb-1 pr-4 border-l-4 border-purple-divider hover:border-purple-bright active:border-purple-bright
              ${heading.depth > 2 ? "pl-8" : "pl-4"}
              ${
                heading.slug === activeId
                  ? "text-purple-bright border-purple-bright"
                  : ""
              }`}
              >
                <a
                  href={`#${heading.slug}`}
                  class={`hover:no-underline hover:text-purple-bright 
                ${
                  heading.slug === activeId
                    ? "text-purple-bright"
                    : "text-white"
                }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default TableOfContents;
