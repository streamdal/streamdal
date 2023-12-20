export const CustomError = ({ children }: { children: any }) => (
  <div class="z-40 absolute top-[100px] mx-4 px-4 flex flex-row justify-between bg-white border-1 border-gray-100 shadow-md items-center rounded">
    <img src="/images/error.png" class="w-[40px] mr-4" />
    <div class="flex flex-col my-3">
      <div class="mb-1">
        {children ||
          (
            <span className="mr-2">
              "There was a problem completing the operation. Please try again
              later"
            </span>
          )}
      </div>

      <div>
        <span class="mr-1">Try</span>
        <a
          href="/"
          class="text-underline cursor-pointer"
        >
          reloading
        </a>.
      </div>
    </div>
  </div>
);
