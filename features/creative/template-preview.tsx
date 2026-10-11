export function Template({
  style,
  color = "var(--color-accent)",
  font,
}: {
  style: string;
  color?: string;
  font?: string;
}) {
  return (
    <div
      className={`template ${style.toLowerCase()}`}
      style={
        { "--template-color": color, fontFamily: font } as React.CSSProperties
      }
    >
      <div className="template-top">
        <span>OLIVE STUDIO</span>
        <span>01 / 12</span>
      </div>
      <div className="template-art">
        <div className="art-circle" />
        <div className="art-arch" />
      </div>
      <div className="template-title">
        A quieter
        <br />
        kind of bold.
      </div>
      <div className="template-bottom">
        A NEW CHAPTER <span>BRAND IDENTITY, 2026</span>
      </div>
    </div>
  );
}
