export type DisplayTheme = {
  id: string;
  name: string;
  colors: {
    background: string;
    paper: string;
    panel: string;
    text: string;
    mutedText: string;
    accent: string;
    warning: string;
    danger: string;
    line: string;
    grid: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    numericFont: string;
  };
  frame: {
    borderStyle: "none" | "simple" | "chart" | "instrument" | "eink";
    cornerStyle: "square" | "rounded" | "ornate";
    texture: "none" | "paper" | "canvas" | "wood" | "ink";
  };
};
