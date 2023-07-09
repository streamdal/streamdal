import { setup } from 'twind'

import { defineConfig } from "https://esm.sh/@twind/core@1.1.3";
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1.1.4";
import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.7";
import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";

export default {
  ...defineConfig({
    presets: [presetTailwind(), presetAutoprefix()],
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
  }),
  selfURL: import.meta.url,
} ;

//
// TODO: This doesn't work...but we need something along these lines
if (IS_BROWSER) {
  setup({
    plugins: {
      ".btn-heimdal": {
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
      },
    },
  })

}


