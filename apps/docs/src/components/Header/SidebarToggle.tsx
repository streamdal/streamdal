/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";
import type { FunctionalComponent } from "preact";
import "./MenuToggle.css";

const MenuToggle: FunctionalComponent = () => {
  const [sidebarShown, setSidebarShown] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (isToggling) return;

    const body = document.querySelector("body");
    setIsToggling(true);

    if (sidebarShown) {
      body.classList.add("mobile-sidebar-toggle");
      body.classList.remove("mobile-menu-hidden");
    } else {
      body.classList.add("mobile-menu-hidden");
      setTimeout(() => {
        body.classList.remove("mobile-sidebar-toggle");
      }, 200);
    }

    setTimeout(() => {
      setIsToggling(false);
    }, 200);
  }, [sidebarShown]);

  const toggleSidebar = () => {
    if (isToggling) return;
    setSidebarShown(!sidebarShown);
  };

  useEffect(() => {
    let resizeTimer;

    const handleResize = () => {
      document.getElementById("left-sidebar").classList.add("no-transition");

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document
          .getElementById("left-sidebar")
          .classList.remove("no-transition");
      }, 300);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <button
      type="button"
      aria-pressed={sidebarShown ? "true" : "false"}
      id="menu-toggle"
      onClick={toggleSidebar}
      className={`hamburger ${sidebarShown ? "is-active" : ""}`}
      style={{
        backgroundColor: "transparent",
        padding: 0,
        border: "none",
      }}
    >
      <span className="bar"></span>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
};

export default MenuToggle;
