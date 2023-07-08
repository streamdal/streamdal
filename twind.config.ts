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
} as Options;
