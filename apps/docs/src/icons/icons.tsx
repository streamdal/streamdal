// I don't think anything is using these, but leaving here for now
// TODO: Replace simple .pngs with svgs in @images
// See: https://icon-sets.iconify.design/

export const Info = (props: any) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30Z"
        fill="url(#paint0_linear_2840_11619)"
      />
      <path
        d="M16.31 16.59H13.87V8.78H16.31V16.59ZM16.31 18.98H13.87V21.11H16.31V18.98Z"
        fill="#E8DFFF"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2840_11619"
          x1="15"
          y1="-0.16"
          x2="15"
          y2="29.84"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#372D56" />
          <stop offset="0.96" stop-color="#372D56" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const Error = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M11 15h2v2h-2v-2m0-8h2v6h-2V7m1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8Z"
      />
    </svg>
  );
};

export const Warning = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"
      />
    </svg>
  );
};
