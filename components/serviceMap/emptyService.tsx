export const EmptyService = () => (
  <div class="z-40 absolute top-[120px] mx-4 px-4 flex flex-row justify-between h-16 bg-white border-1 border-gray-100 shadow-md items-center rounded">
    <img src="/images/help.png" class="w-[40px] mr-4" />
    No services defined. Create a service in Snitch by connecting an SDK client!
    Read more
    <a
      target="_new"
      class="ml-1 text-underline unerline-offset-2 cursor-pointer"
      href="https://github.com/streamdal/snitch"
    >
      here
    </a>.
  </div>
);
