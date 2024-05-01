export const Kebab = (props: any) => {
  const fillColor = props?.fill || "#6F767E";

  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.5 6.5C14.5 7.60457 13.6046 8.5 12.5 8.5C11.3954 8.5 10.5 7.60457 10.5 6.5C10.5 5.39543 11.3954 4.5 12.5 4.5C13.6046 4.5 14.5 5.39543 14.5 6.5Z"
        fill={fillColor}
      />
      <path
        d="M14.5 12.5C14.5 13.6046 13.6046 14.5 12.5 14.5C11.3954 14.5 10.5 13.6046 10.5 12.5C10.5 11.3954 11.3954 10.5 12.5 10.5C13.6046 10.5 14.5 11.3954 14.5 12.5Z"
        fill={fillColor}
      />
      <path
        d="M14.5 18.5C14.5 19.6046 13.6046 20.5 12.5 20.5C11.3954 20.5 10.5 19.6046 10.5 18.5C10.5 17.3954 11.3954 16.5 12.5 16.5C13.6046 16.5 14.5 17.3954 14.5 18.5Z"
        fill={fillColor}
      />
    </svg>
  );
};

export const Loading = (props: any) => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-violet-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    >
    </circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    >
    </path>
  </svg>
);
