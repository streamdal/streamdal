import { NavMenu } from "./navMenu.tsx";

export const NavBar = () => {
  return (
    <div className="sticky z-50 px-4 flex flex-row justify-between w-full h-16 bg-white border-1 border-gray-100 shadow-sm items-center rounded-br-lg">
      <div className={"flex items-center"}>
        <NavMenu />
        <a href="/" className={""}>
          <img
            src="/images/snitch-logo.svg"
            className="w-44 h-fit ml-3 my-2"
          />
        </a>
      </div>
    </div>
  );
};
