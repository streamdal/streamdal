import { NavMenu } from "./navMenu.tsx";
import { BirdLogo } from "../icons/logo.tsx";

export const NavBar = () => {
  return (
    <div className="sticky z-50 px-4 flex flex-row justify-between w-full h-16 bg-white border-1 border-gray-100 shadow-sm items-center rounded-br-lg">
      <div className={"flex items-center"}>
        <NavMenu />
        <a href="/">
          <BirdLogo className={"w-56 h-auto ml-3 my-1"} />
        </a>
      </div>
    </div>
  );
};
