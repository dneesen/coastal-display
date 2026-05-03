import type { ReactNode } from "react";
import type { DisplayMode } from "../../types/display";

type DisplayFrameProps = {
  mode: DisplayMode;
  children: ReactNode;
};

export function DisplayFrame({ mode, children }: DisplayFrameProps) {
  return <div className={`display-frame ${mode === "eink" ? "eink-frame" : ""}`}>{children}</div>;
}
