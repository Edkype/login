// client/src/theme.ts
import { createDarkTheme } from "@fluentui/react-components";
import type { BrandVariants, Theme } from "@fluentui/react-components";

// This is the custom orange palette to match your images
const orangeBrandRamp: BrandVariants = {
  10: "#290F00",
  20: "#431700",
  30: "#5F2200",
  40: "#7C2E00",
  50: "#9B3B00",
  60: "#BA4900",
  70: "#DA5700",
  80: "#FA6700", // Main brand color
  90: "#FF7F24",
  100: "#FF9546",
  110: "#FFAC6A",
  120: "#FFC18E",
  130: "#FFD5B3",
  140: "#FFE9D8",
  150: "#FFF5EC",
  160: "#FFFBFA",
};

// We use createDarkTheme to automatically generate all the shadow/hover/press states
export const enderBkTheme: Theme = {
  ...createDarkTheme(orangeBrandRamp),
  
  // Custom override for that "glassy" card look
  colorNeutralBackground1: "#202020cc", 
};