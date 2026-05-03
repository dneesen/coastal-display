type UnavailableNoticeProps = {
  title: string;
  detail: string;
};

export function UnavailableNotice({ title, detail }: UnavailableNoticeProps) {
  return (
    <div className="unavailable-notice">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
