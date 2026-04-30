import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { PUBLIC_DEMO_SITES, type PublicDemoSite } from "@/lib/public-demo-sites";

interface PublicDemoGridProps {
  items?: PublicDemoSite[];
}

export default function PublicDemoGrid({ items = PUBLIC_DEMO_SITES }: PublicDemoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((project, index) => (
        <motion.article
          key={project.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: 0.45, delay: index * 0.06 }}
          className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_64px_rgba(3,2,10,0.3)] backdrop-blur-xl"
        >
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            aria-label={`Abrir demo de ${project.title}`}
          >
            <div className="relative aspect-[16/8.2] overflow-hidden border-b border-white/8 bg-black/30 sm:aspect-[16/8]">
              <OptimizedImage
                src={project.image}
                alt={project.title}
                width={1280}
                height={800}
                className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
                fetchPriority="auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090611]/92 via-[#090611]/18 to-transparent" />
              <div className="absolute left-4 top-4">
                <span className="inline-flex rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-white/72 backdrop-blur-md">
                  {project.segment}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mb-2 inline-flex rounded-full border border-[rgba(229,92,92,0.18)] bg-[linear-gradient(135deg,rgba(229,92,92,0.16),rgba(130,76,207,0.16),rgba(238,105,173,0.12))] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/72">
                    {project.icon}
                  </span>
                  <h3 className="text-[1.45rem] font-black tracking-tight text-white/92 sm:text-[1.65rem]">
                    {project.title}
                  </h3>
                </div>

                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/78 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/24 group-hover:bg-white/10 group-hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>

              <p className="text-sm leading-6 text-white/62">{project.description}</p>

              <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
                  Demo publicada
                </span>
                <span className="text-sm font-semibold text-white/82 transition-colors duration-300 group-hover:text-white">
                  Ver site
                </span>
              </div>
            </div>
          </a>
        </motion.article>
      ))}
    </div>
  );
}
