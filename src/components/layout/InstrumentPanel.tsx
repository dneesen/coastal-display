import type { ReactNode } from "react";

type InstrumentPanelProps = {
  title: string;
  note?: string;
  area?: string;
  children: ReactNode;
};

export function InstrumentPanel({ title, note, area, children }: InstrumentPanelProps) {
  return (
    <section className="instrument-panel" style={area ? { gridArea: area } : undefined}>
      <div className="panel-heading">
        <h2>{title}</h2>
        {note ? <span>{note}</span> : null}
      </div>
      {children}
    </section>
  );
}
