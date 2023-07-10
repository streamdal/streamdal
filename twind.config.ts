import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      colors: {
        streamdalYellow: "#FFD260",
        streamdalOrange: "#F8A577",
        streamdalPurple: "#956CFF",
        streamdalGreen: "#03CBA7",
        streamdalBlue: "#3197FF",
        streamdalRed: "#FF4040",
        streamdalPink: "#F489B0",
        web: "#372D56",
        eyelid: "#FF7D68",
        shadow: "#c0aafe",
        sunset: "#F9F7FF",
        stormCloud: "#7C7C86",
        haze: "#D1D3D9",
        cloud: "#FFFFFF",
        stream: "#C1AAFD",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  plugins: {
    // Basic workaround for old twind version not supporting
    // the `basis-*` keyword
    basis: (parts: any) => {
      let value;
      const arr = parts[0].split("/");
      if (arr.length === 2) {
        value = `${(+arr[0] / +arr[1]) * 100}%`;
      } else if (parts.length === 1) {
        value = parts[0];
      }
      return {
        "flex-basis": value,
      };
    },
    "btn-heimdal": () => {
      return {
        width: "137px",
        height: "47px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#372D56",
        background: "#FFD260",
        cursor: "pointer",
        "&:hover": {
          background:
            "linear-gradient(96.41deg, #C1AAFD -16.36%, #FFD260 101.19%)",
        },
      };
    },
  },
} as Options;
