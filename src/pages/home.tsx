import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { ScrollFade } from "@/components/ui/scroll-fade";
import { ModelViewerWrapper } from "@/components/ui/model-viewer-wrapper";
import { ImageTabs } from "@/components/ui/image-tabs";
import { BulletList, ProjectCarousel, Tags } from "@/components/ui/project-carousel";
import { VideoSlot } from "@/components/ui/video-slot";
import { NeuralNetViz } from "@/components/visuals/neural-net-viz";
import { cadProjects, droneProject, gridProjects, papers, perceptionLead, personalInfo, roboticsProjects, simulationProjects, softwareProjects } from "@/data/portfolio";

function Section({ id, num, title, intro, tone, children }: { id: string; num: string; title: string; intro: string; tone: "light" | "dark"; children: ReactNode }) {
  const light = tone === "light";
  return (
    <section id={id} className={`py-24 md:py-32 border-t ${light ? "border-rule bg-paper text-dark" : "border-line bg-ink"}`}>
      <div className="mx-auto w-[min(1200px,100%-48px)]">
        <ScrollFade className="mb-14 grid gap-x-7 gap-y-2 md:grid-cols-[auto_1fr]">
          <span className="font-mono text-xs tracking-widest text-sig md:row-span-2 md:pt-3.5">{num}</span>
          <h2 className="text-5xl">{title}</h2>
          <p className={`max-w-[58ch] ${light ? "text-mid" : "text-muted"}`}>{intro}</p>
        </ScrollFade>
        {children}
      </div>
    </section>
  );
}

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});
type ContactValues = z.infer<typeof contactSchema>;

function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (v: ContactValues) => {
    if (!personalInfo.web3formsKey) {
      setStatus({ ok: false, text: `The form isn't connected yet. Email me directly at ${personalInfo.email}.` });
      return;
    }
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: personalInfo.web3formsKey, subject: `Portfolio message from ${v.name}`, ...v }),
      });
      const j = await r.json();
      if (!j.success) throw new Error("failed");
      setStatus({ ok: true, text: "Message sent. Thanks for reaching out." });
      reset();
    } catch {
      setStatus({ ok: false, text: `Couldn't send. Please email ${personalInfo.email}.` });
    }
  };

  const field = "w-full border border-line bg-ink px-3 py-2.5 text-sm text-cream outline-none focus:border-cream/35";
  const fields = [
    { key: "name", label: "Your Name", type: "text", ph: "Jane Smith", auto: "name" },
    { key: "email", label: "Email Address", type: "email", ph: "jane@company.com", auto: "email" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 border border-line bg-ink-2 p-8">
      <h3 className="text-xl">Send a Message</h3>
      {fields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`f-${f.key}`} className="mb-1.5 block text-xs text-muted">{f.label}</label>
          <input id={`f-${f.key}`} type={f.type} autoComplete={f.auto} placeholder={f.ph} className={field} aria-invalid={!!errors[f.key]} aria-describedby={`e-${f.key}`} {...register(f.key)} />
          <p id={`e-${f.key}`} role="alert" className="mt-1 min-h-4 text-xs text-[#ff8d8d]">{errors[f.key]?.message}</p>
        </div>
      ))}
      <div>
        <label htmlFor="f-message" className="mb-1.5 block text-xs text-muted">Message</label>
        <textarea id="f-message" rows={4} placeholder="Tell me about the role, the research, or the project." className={`${field} resize-none`} aria-invalid={!!errors.message} aria-describedby="e-message" {...register("message")} />
        <p id="e-message" role="alert" className="mt-1 min-h-4 text-xs text-[#ff8d8d]">{errors.message?.message}</p>
      </div>
      <button type="submit" disabled={isSubmitting} className="min-h-11 bg-cream px-6 py-3 text-sm font-medium text-dark hover:bg-white disabled:opacity-60">
        {isSubmitting ? "Sending…" : "Send Message"}
      </button>
      <p role="status" className={`text-sm ${status?.ok ? "text-[#7fcf8f]" : "text-muted"}`}>{status?.text}</p>
    </form>
  );
}

export default function Home() {
  const p = personalInfo;
  const [first, ...rest] = p.name.split(" ");

  return (
    <>
      {/* HERO */}
      <section aria-label="Introduction" className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-6 pb-20 pt-32">
        <div className="relative z-10 max-w-4xl text-center">
          <p className="mb-6 text-muted-2">{p.title}</p>
          <h1 className="mb-6 text-[clamp(3.8rem,11vw,8.6rem)] leading-[0.92]">{first} <em className="text-muted-2">{rest.join(" ")}</em></h1>
          <ul className="mb-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted">
            {p.affiliations.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <div className="flex flex-wrap justify-center gap-3.5">
            <a href="/#software" className="bg-cream px-6 py-3 text-sm font-medium text-dark hover:bg-white">View Work</a>
            {p.resumeUrl && <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" className="border border-line px-6 py-3 text-sm font-medium text-muted-2 hover:border-cream/35 hover:text-cream">Resume</a>}
          </div>
        </div>
      </section>

      {/* 01 PERCEPTION & SOFTWARE */}
      <Section id="software" num="01" title="Perception & Software" intro="Vision pipelines and tracking systems for machines that move: detect, estimate, decide." tone="light">
        <div className="flex flex-col gap-6">
          <ScrollFade>
            <article className="grid border border-rule bg-paper-2 lg:grid-cols-2">
              <div className="h-[380px] bg-[#0b0e11] lg:h-[520px]">
                <VideoSlot url={perceptionLead.video.url} caption={perceptionLead.video.caption} alt={perceptionLead.title} />
              </div>
              <div className="flex flex-col justify-center border-t border-rule p-8 lg:border-l lg:border-t-0 lg:p-12">
                <p className="mb-4 text-sm text-mid"><b className="font-medium text-dark">{perceptionLead.role}</b><br />{perceptionLead.organization} · {perceptionLead.dateRange}</p>
                <h3 className="mb-4 text-4xl">{perceptionLead.title}</h3>
                <p className="mb-4 text-mid">{perceptionLead.description}</p>
                <p className="mb-5 font-serif text-xl">{perceptionLead.steps.join(" → ")}</p>
                <BulletList items={perceptionLead.points} />
                <Tags items={perceptionLead.tags} />
                {perceptionLead.githubUrl && <a href={perceptionLead.githubUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-1.5 self-start border border-dark px-5 text-sm font-medium text-dark hover:bg-dark hover:text-cream">{perceptionLead.githubLabel} <ArrowUpRight size={16} aria-hidden="true" /></a>}
              </div>
            </article>
          </ScrollFade>
          {softwareProjects.map((s) => (
            <ScrollFade key={s.id}>
              <article className={`border border-rule bg-paper-2 ${s.visual ? "grid lg:grid-cols-2" : "p-8 md:p-10"}`}>
                <div className={s.visual ? "p-8 md:p-10" : ""}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div><p className="text-sm text-mid">{s.kind}</p><h3 className="text-3xl">{s.title}</h3></div>
                    {(s.githubUrl || s.demoUrl) && <a href={s.githubUrl ?? s.demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${s.title}`} className="grid size-11 shrink-0 place-items-center hover:opacity-55"><ArrowUpRight size={18} /></a>}
                  </div>
                  <p className="mb-4 max-w-[80ch] text-sm text-mid">{s.description}</p>
                  {s.steps && <p className="mb-5 font-serif text-lg">{s.steps.join(" → ")}</p>}
                  <BulletList items={s.points} />
                  <Tags items={s.tags} />
                </div>
                {s.visual === "neural-net" && (
                  <div className="border-t border-rule bg-[#0b0e11] text-cream lg:border-l lg:border-t-0"><NeuralNetViz /></div>
                )}
              </article>
            </ScrollFade>
          ))}
        </div>
      </Section>

      {/* 02 RESEARCH */}
      <Section id="research" num="02" title="Research" intro="Published and presented work in computer vision and signal processing." tone="dark">
        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {papers.map((r) => (
            <article key={r.id} className="flex flex-col bg-ink p-8 transition-colors hover:bg-ink-2 md:p-10">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-sig">{r.venue}</span>
                <span className="text-sm text-muted">{r.lab}</span>
              </div>
              <p className="mb-3 text-xs text-muted-2">{r.status}</p>
              <h3 className="mb-3.5 text-3xl">{r.title}</h3>
              <p className="mb-5 text-sm text-muted">{r.description}</p>
              <BulletList items={r.points} dark />
              <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                <ul className="flex flex-wrap gap-1.5">{r.tags.map((t) => <li key={t} className="bg-ink-3 px-2 py-1 font-mono text-[0.68rem] text-muted-2">{t}</li>)}</ul>
                {r.paperUrl
                  ? <a href={r.paperUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm hover:text-sig">Read the paper <ArrowUpRight size={16} /></a>
                  : <span className="text-sm text-muted">Paper link coming</span>}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 03 ROBOTICS */}
      <Section id="robotics" num="03" title="Robotics" intro="Motion planning, AprilTag auto-aim, and control for a competition robot." tone="light">
        <div className="flex flex-col gap-6">
          {roboticsProjects.map((c) => (
            <ScrollFade key={c.id}>
              <article className="grid border border-rule bg-paper-2 lg:grid-cols-2">
                <div className="h-[380px] lg:h-[520px]"><ModelViewerWrapper src={c.glbFileUrl} imageUrl={c.imageUrl} alt={c.imageAlt ?? c.title} label="Robot" /></div>
                <div className="flex flex-col justify-center border-t border-rule p-8 lg:border-l lg:border-t-0 lg:p-12">
                  <p className="mb-4 text-sm text-mid"><b className="font-medium text-dark">{c.role}</b><br />{c.organization} · {c.dateRange}</p>
                  <h3 className="mb-4 text-4xl">{c.title}</h3>
                  <p className="mb-5 text-mid">{c.description}</p>
                  {c.stats && (
                    <dl className="mb-5 flex flex-wrap gap-x-9 gap-y-4">
                      {c.stats.map((s) => <div key={s.label}><dd className="font-serif text-4xl leading-none text-dark">{s.value}</dd><dt className="text-xs text-mid">{s.label}</dt></div>)}
                    </dl>
                  )}
                  <BulletList items={c.points} />
                  <Tags items={c.tags} />
                  {c.link && <Link href={c.link.href} className="mt-6 inline-flex min-h-11 items-center gap-1.5 self-start border border-dark px-5 text-sm font-medium text-dark hover:bg-dark hover:text-cream">{c.link.label} <ArrowUpRight size={16} aria-hidden="true" /></Link>}
                </div>
              </article>
            </ScrollFade>
          ))}
        </div>
      </Section>

      {/* 04 HARDWARE & DESIGN (includes the simulation / analysis study) */}
      <Section id="hardware" num="04" title="Hardware & Design" intro="The airframe and electronics the software runs on. Drag the 3D models to look around." tone="dark">
        <div className="flex flex-col gap-6">
          {cadProjects.map((c) => (
            <ScrollFade key={c.id}>{c.slides && <ProjectCarousel project={c} />}</ScrollFade>
          ))}
          <div id="simulation" className="grid scroll-mt-20 gap-px border border-line bg-line">
            {simulationProjects.map((s) => (
              <article key={s.id} className={`bg-ink ${s.images ? "grid md:grid-cols-2" : "p-8"}`}>
                {s.images && <div className="h-[340px] border-b border-line md:h-auto md:min-h-[420px] md:border-b-0 md:border-r"><ImageTabs views={s.images} /></div>}
                <div className={s.images ? "p-8 md:p-10" : ""}>
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-sig">{s.category} · {s.dateRange}</p>
                  <h3 className="mb-3 text-3xl">{s.title}</h3>
                  <p className="mb-5 text-sm text-muted">{s.description}</p>
                  <BulletList items={s.points} dark />
                  <ul className="flex flex-wrap gap-1.5">{s.tags.map((t) => <li key={t} className="bg-ink-3 px-2 py-1 font-mono text-[0.68rem] text-muted-2">{t}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* 05 PROJECTS GRID */}
      <Section id="projects" num="05" title="More Projects" intro="Independent builds and team designs." tone="light">
        <ScrollFade className="mb-6"><ProjectCarousel project={droneProject} /></ScrollFade>
        <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
          {gridProjects.map((g) => (
            <article key={g.id} className="flex flex-col bg-paper">
              <div className="h-[260px] border-b border-rule md:h-[320px]"><ModelViewerWrapper src={g.glbFileUrl} imageUrl={g.imageUrl} alt={g.title} label={g.title.split(" ")[0]} /></div>
              <div className="p-7">
                <p className="mb-3 text-sm text-mid">{g.organization} · {g.dateRange}</p>
                <h3 className="mb-2.5 text-2xl">{g.title}</h3>
                <p className="mb-4 text-sm text-mid">{g.description}</p>
                <Tags items={g.tags} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 06 ABOUT */}
      <section id="about" className="border-t border-line bg-ink py-24 md:py-32">
        <div className="mx-auto grid w-[min(1200px,100%-48px)] gap-12 md:grid-cols-[3fr_4fr_5fr]">
          <ScrollFade>
            <div className="relative aspect-[3/4] max-w-xs overflow-hidden border border-line bg-ink-2">
              {p.photoUrl
                ? <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover object-[center_15%]" />
                : <div className="grid h-full place-items-center font-serif text-7xl text-muted" aria-hidden="true">{p.name.split(" ").map((w) => w[0]).join("")}</div>}
            </div>
          </ScrollFade>
          <ScrollFade delay={0.07}>
            <h2 className="mb-5 text-5xl">About Me</h2>
            <p className="mb-8 text-muted">{p.bio}</p>
            <dl className="space-y-5 text-sm">
              <div><dt className="mb-1 text-muted">Education</dt><dd>{p.education}</dd></div>
              <div><dt className="mb-1 text-muted">Current Focus</dt><dd>{p.currentFocus}</dd></div>
              <div><dt className="mb-1 text-muted">Organizations</dt><dd><ul>{p.organizations.map((o) => <li key={o}>{o}</li>)}</ul></dd></div>
            </dl>
          </ScrollFade>
          <ScrollFade delay={0.14}>
            <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-sig">Experience</h3>
            <ul className="mb-9 border-l border-line">
              {p.previousWork.map((e) => (
                <li key={e.role + e.org} className="relative pb-5 pl-6">
                  <span className={`absolute -left-1 top-2 size-[7px] border ${e.now ? "border-sig bg-sig" : "border-cream bg-ink"}`} aria-hidden="true" />
                  <p className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">{e.when}{e.now ? " · current" : ""}</p>
                  <p className="font-serif text-xl leading-tight">{e.role}</p>
                  <p className="text-sm text-muted">{e.org}</p>
                </li>
              ))}
            </ul>
            <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-sig">Skills</h3>
            {p.skills.map((g) => (
              <div key={g.group} className="mb-4 border-t border-line pt-4">
                <p className="mb-2.5 text-xs text-muted">{g.group}</p>
                <ul className="flex flex-wrap gap-1.5">{g.items.map((i) => <li key={i} className="border border-line bg-ink-2 px-2.5 py-1 text-sm">{i}</li>)}</ul>
              </div>
            ))}
          </ScrollFade>
        </div>
      </section>

      {/* 07 CONTACT */}
      <section id="contact" className="border-t border-line bg-paper py-24 text-dark md:py-32">
        <div className="mx-auto w-[min(960px,100%-48px)]">
          <ScrollFade className="mb-11">
            <h2 className="mb-3 text-5xl">Get in Touch</h2>
            <p className="max-w-[58ch] text-mid">Open to internships, research positions, and conversations about physical AI, humanoids, and robotics.</p>
          </ScrollFade>
          <ScrollFade>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 border border-line bg-ink p-8 text-cream">
                <h3 className="text-xl">Contact</h3>
                <a href={`mailto:${p.email}`} className="break-all text-sm font-medium hover:text-sig">{p.email}</a>
                {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-sig">LinkedIn</a>}
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-sig">GitHub</a>}
              </div>
              <ContactForm />
            </div>
          </ScrollFade>
        </div>
      </section>
    </>
  );
}
