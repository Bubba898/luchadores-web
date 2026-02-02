export type MaskLayout = {
  leftPercent: number;
  scaleClass: string;
};

export const getMaskLayout = (mask?: string | null): MaskLayout => {
if (!mask) {
      return {leftPercent: 0, scaleClass: "scale-[0.75]"};
    }
    if (mask.includes("1")) {
      return {leftPercent: 0, scaleClass: "scale-[0.72]"};
    }
    if (mask.includes("2")) {
      return {leftPercent: -3, scaleClass: "scale-[0.65]"};
    }
    if (mask.includes("3")) {
      return {leftPercent: 0, scaleClass: "scale-[0.75]"};
    }
    return {leftPercent: 0, scaleClass: "scale-[0.75]"};
};
