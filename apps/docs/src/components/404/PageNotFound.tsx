import error from "@images/raven/raven_error.png";

const PageNotFound = () => (
  <div class="flex-col justify-center items-center w-full prose-h1:no-underline">
    <img src={error} class="w-1/2 mx-auto" />
    <h2 class="flex justify-center w-full max-w-none text-center font-sans leading-5 text-2xl	">
      Whoops!
    </h2>
    <p class="text-center mx-auto w-5/6 font-sans leading-6 text-md">
      We don't have that page. Pray forgive us, and return from where thy came.
    </p>
    <a href={"/en/what-is-streamdal"} class="hover:no-underline">
      <button class="mx-auto my-10 bg-yellow-accent rounded text-purple-darkText text-sm font-normal py-3.5 px-5 hover:bg-gradient-to-r from-purple-light to-yellow-accent font-sans">
        Home
      </button>
    </a>
  </div>
);

export default PageNotFound;
