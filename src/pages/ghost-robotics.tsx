import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ghostRobotics } from "@/data/portfolio";

// Canvas visuals load only on this page, so the home page bundle stays small.
const AutoAim = lazy(() => import("@/components/visuals/auto-aim"));
const ShootOnTheMove = lazy(() => import("@/components/visuals/shoot-on-the-move"));
const Auto21Paths = lazy(() => import("@/components/visuals/auto-21-paths"));

const TABS = [
  { id: "auto-aim", label: "Auto-aim", blurb: "Distance sets turret, flywheel and hood", View: AutoAim },
  { id: "shoot-on-the-move", label: "Shoot on the move", blurb: "Predict the robot, aim from there", View: ShootOnTheMove },
  { id: "auto-21", label: "21-ball auto", blurb: "Seven scoring trips, path by path", View: Auto21Paths },
] as const;

const fromHash = () => {
  const id = window.location.hash.replace("#", "");
  return TABS.some((t) => t.id === id) ? id : TABS[0].id;
};

export default function GhostRobotics() {
  const [active, setActive] = useState<string>(fromHash);

  useEffect(() => {
    const onHash = () => setActive(fromHash());
    window.addEventListener("hashchange", onHash);
    window.scrollTo(0, 0);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = (id: string) => { setActive(id); history.replaceState(null, "", `#${id}`); };
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="mx-auto w-[min(1200px,100%-48px)] pb-24 pt-28">
      <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-cream"><ArrowLeft size={16} aria-hidden="true" /> Back to portfolio</Link>
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-sig">FTC Team 3565 Ghost Robotics · Software Lead & Captain</p>
      <h1 className="mb-5 text-[clamp(2.6rem,6vw,4.6rem)]">Robotics software, in motion</h1>
      <p className="mb-6 max-w-[68ch] text-muted-2">
        Three pieces of the 2025–26 DECODE robot, rebuilt as interactive demos from the team's own code: auto-aiming from a distance table, predicting a moving robot to shoot on the move, and the 21-ball autonomous routine.
      </p>
      <a href={ghostRobotics.repoUrl} target="_blank" rel="noopener noreferrer" className="mb-10 inline-flex min-h-11 items-center gap-1.5 text-sm hover:text-sig">View the code on GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>

      <div role="tablist" aria-label="Robotics demos" className="mb-8 grid gap-px border border-line bg-line md:grid-cols-3">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls={`panel-${t.id}`} onClick={() => select(t.id)}
            className={`min-h-11 px-5 py-4 text-left ${active === t.id ? "bg-cream text-dark" : "bg-ink text-muted-2 hover:bg-ink-2"}`}>
            <span className="block font-serif text-2xl">{t.label}</span>
            <span className={`block text-xs ${active === t.id ? "text-mid" : "text-muted"}`}>{t.blurb}</span>
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`}>
        <Suspense fallback={<p role="status" className="py-24 text-center font-mono text-xs uppercase tracking-wider text-muted">Loading demo…</p>}>
          <tab.View />
        </Suspense>
      </section>
    </div>
  );
}
