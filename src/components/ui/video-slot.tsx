import { Play } from "lucide-react";

interface Props {
  url?: string;
  poster?: string;
  caption: string;
  alt: string;
}

/* Video slot. With no url it shows a placeholder frame; add a file to public/videos/
   and set video.url in portfolio.ts (e.g. "/videos/detection-demo-v1.mp4"). */
export function VideoSlot({ url, poster, caption, alt }: Props) {
  if (url) {
    return (
      <video src={url} poster={poster} controls playsInline preload="metadata" aria-label={alt} className="h-full w-full bg-black object-contain" />
    );
  }
  return (
    <div className="grid h-full w-full place-items-center bg-[#0f1317] p-6" role="img" aria-label={`Placeholder: ${caption}`}>
      <div className="flex flex-col items-center gap-4 border border-dashed border-line px-8 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full border border-muted text-muted-2"><Play size={22} aria-hidden="true" /></span>
        <p className="font-mono text-[0.68rem] uppercase tracking-wider text-muted-2">{caption}</p>
      </div>
    </div>
  );
}
