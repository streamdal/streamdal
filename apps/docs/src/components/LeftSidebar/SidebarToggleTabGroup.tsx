import { useState } from "preact/hooks";
import "./TabGroup.css";

interface Props {
  defaultActiveTab: "learn" | "api";
  labels: {
    learn: string;
    api: string;
  };
}

const SidebarToggleTabGroup = ({ defaultActiveTab, labels }: Props) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const toggle = (type: "learn" | "api") => {
    document
      .querySelectorAll(`li.nav-group`)
      .forEach((el) => el.classList.remove("active"));
    document
      .querySelectorAll(`li.nav-group.${type}`)
      .forEach((el) => el.classList.add("active"));
    setActiveTab(type);
  };

  return (
    <div className="TabGroup">
      <button
        className={activeTab === "learn" ? "active" : ""}
        onClick={() => toggle("learn")}
      >
        {labels.learn}
      </button>
      <button
        className={activeTab === "api" ? "active" : ""}
        onClick={() => toggle("api")}
      >
        {labels.api}
      </button>
    </div>
  );
};

export default SidebarToggleTabGroup;
