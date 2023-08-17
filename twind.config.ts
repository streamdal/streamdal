import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  important: true,
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
        lunar: "#8E84AD",
        twilight: "#E6DDFE",
        drab: "#F7E7CC",
        burnt: "#AF8E3A",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Space Grotesk"],
      },
      backgroundImage: {
        "login": "url('/images/login/gradient.svg')",
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
    "btn-secondary": () => {
      return {
        width: "100px",
        height: "47px",
        borderRadius: "4px",
        border: "none",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#372D56",
        "&:hover": {
          background: "#F9F7FF",
        },
      };
    },
    "btn-dark": () => {
      return {
        width: "137px",
        height: "37px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        paddingRight: "5px",
        paddingLeft: "5px",
        color: "#FFFFFF",
        background: "#2E2647",
        cursor: "pointer",
        fill: "#FFFFFF",
        "&:hover": {
          background: "#FFD260",
          color: "#372D56",
          fill: "#372D56",
        },
      };
    },
    "btn-delete": () => {
      return {
        width: "137px",
        height: "47px",
        borderRadius: "4px",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#FFFFFF",
        background: "#FF7D68",
        cursor: "pointer",
        "&:hover": {
          background:
            "linear-gradient(96.41deg, #FF7D68 -16.36%, #FFB9AD 101.19%)",
        },
      };
    },
  },
} as Options;
