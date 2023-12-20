export const ServerError = ({ message }: { message: string }) => (
  <div class="z-40 absolute top-[100px] mx-4 px-4 flex flex-row justify-between bg-white border-1 border-gray-100 shadow-md items-center rounded">
    <img src="/images/error.png" class="w-[40px] mr-4" />
    <div class="flex flex-col my-3">
      <div class="mb-1">
        <span class="mr-2">
          {message ||
            "There was a problem completing the operation. Please try again later"}
        </span>
      </div>

      <div>
        <span>Read more about the Streamdal server</span>{" "}
        <a
          target="_new"
          class="text-underline cursor-pointer"
          href="https://github.com/streamdal/streamdal"
        >
          here
        </a>.
        <span class="mx-1">Try</span>
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
