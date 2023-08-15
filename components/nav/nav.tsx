import { NavMenu } from "./navMenu.tsx";

export const NavBar = () => {
  return (
    <div className="sticky z-50 top-4 mx-4 px-4 flex flex-row justify-between h-16 bg-white border-1 border-gray-100 shadow-md items-center rounded">
      <div className={"flex items-center"}>
        <NavMenu />
        <a href="/" className={""}>
          <img
            src="/images/snitch-logo.svg"
            className="w-44 h-fit ml-4 my-2"
          />
        </a>
      </div>
    </div>
  );
};
