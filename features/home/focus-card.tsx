import { Leaf } from "lucide-react";
export function FocusCard() {
  return (
    <section className="focus-card">
      <div className="focus-kicker">
        <Leaf size={15} /> SET YOUR PRIORITY
      </div>
      <h2>
        Choose your priority.
        <br />
        Take action.
      </h2>
      <p>
        Identify the task that matters most.
        <br />
        Start there.
      </p>
      <div className="focus-art">
        <span className="arch back" />
        <span className="arch front" />
        <span className="sun" />
        <span className="art-line" />
      </div>
      <div className="focus-bottom">Protect time for focused work.</div>
    </section>
  );
}
