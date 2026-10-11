export function PageHeading({
  eyebrow,
  title,
  description,
  guidance,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  guidance?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        {guidance && <p>{guidance}</p>}
      </div>
      {action}
    </div>
  );
}
