import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Menu, X, Mail } from "lucide-react";
import { personalInfo } from "@/data/portfolio";

const NAV = [
  { id: "software", label: "Perception" },
  { id: "research", label: "Research" },
  { id: "robotics", label: "Robotics" },
  { id: "hardware", label: "Hardware" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const nav = document.getElementById("site-nav")?.offsetHeight ?? 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - nav, behavior: "smooth" });
  return true;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [loc, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // After navigating home from another route, finish the stashed anchor scroll.
  useEffect(() => {
    const target = sessionStorage.getItem("scrollTarget");
    if (target && loc === "/") {
      sessionStorage.removeItem("scrollTarget");
      setTimeout(() => scrollToId(target), 50);
    }
  }, [loc]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (loc === "/") scrollToId(id);
    else { sessionStorage.setItem("scrollTarget", id); navigate("/"); }
  };

  const links = NAV.map((n) => (
    <a key={n.id} href={`/#${n.id}`} onClick={go(n.id)} className="text-sm text-muted transition-colors hover:text-cream max-md:block max-md:border-b max-md:border-line max-md:py-3 max-md:text-base">
      {n.label}
    </a>
  ));
  const resume = personalInfo.resumeUrl && (
    <a href={personalInfo.resumeUrl} target="_blank" rel="noopener noreferrer" className="bg-cream px-4 py-2 text-sm font-medium text-dark hover:bg-white">Resume</a>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:bg-cream focus:px-3 focus:py-2 focus:text-dark">Skip to content</a>
      <header id="site-nav" className={`fixed inset-x-0 top-0 z-50 border-b border-line backdrop-blur-md transition-all ${scrolled ? "bg-ink/70 shadow-lg" : "bg-ink/25"}`}>
        <div className={`mx-auto flex w-[min(1200px,100%-48px)] items-center justify-between transition-all ${scrolled ? "h-14" : "h-[72px]"}`}>
          <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="font-serif text-2xl text-cream/85 hover:text-cream">{personalInfo.name}</a>
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">{links}{resume}</nav>
          <button className="grid size-11 place-items-center md:hidden" aria-label="Toggle menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-ink px-6 pb-5 pt-2 md:hidden">{links}{resume && <div className="pt-4">{resume}</div>}</nav>}
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-line bg-ink-2 py-8">
        <div className="mx-auto flex w-[min(1200px,100%-48px)] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{personalInfo.name}</p>
            <p className="text-xs text-muted">Computer Engineering at UIUC, {new Date().getFullYear()}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <a href={`mailto:${personalInfo.email}`} aria-label="Email" className="grid size-11 place-items-center hover:text-cream"><Mail size={18} /></a>
            {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 hover:text-cream">LinkedIn</a>}
            {personalInfo.githubUrl && <a href={personalInfo.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 hover:text-cream">GitHub</a>}
          </div>
        </div>
      </footer>
    </>
  );
}
