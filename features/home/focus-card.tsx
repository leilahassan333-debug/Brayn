import { Leaf } from "lucide-react";
export function FocusCard() {
  return (
    <section className="focus-card">
      <div className="focus-kicker">
        <Leaf size={15} /> A MOMENT OF FOCUS
      </div>
      <h2>
        Less busy.
        <br />
        More meaningful.
      </h2>
      <p>
        You don’t have to do it all today.
        <br />
        Just the next right thing.
      </p>
      <div className="focus-art">
        <span className="arch back" />
        <span className="arch front" />
        <span className="sun" />
        <span className="art-line" />
      </div>
      <div className="focus-bottom">Your ideas deserve breathing room.</div>
    </section>
  );
}
