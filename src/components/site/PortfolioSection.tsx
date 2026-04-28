import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["Todos", "Landing Page", "E-commerce", "Institucional"];

const projects = [
  {
    id: 1,
    title: "Açaí Fast",
    category: "E-commerce",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
  {
    id: 2,
    title: "Clínica Novaes",
    category: "Institucional",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
  {
    id: 3,
    title: "Barbearia Vip",
    category: "Landing Page",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
  {
    id: 4,
    title: "Imóveis Premium",
    category: "Landing Page",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    link: "#",
  },
];

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredProjects = projects.filter(
    (project) => activeFilter === "Todos" || project.category === activeFilter
  );

  return (
    <section id="portfolio" className="site-band py-28 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="site-badge site-badge--primary mb-4">Nosso Trabalho</span>
            <h2 className="text-[clamp(2rem,7vw,3.75rem)] font-black text-white/90 leading-[0.92] tracking-tighter">
              Projetos que entregam <span className="site-gradient-text">resultados</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-white/40 mr-2 hidden sm:block" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  activeFilter === category
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className="group relative rounded-[2rem] overflow-hidden aspect-[4/3] sm:aspect-[16/9] border border-white/10 cursor-pointer"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <div className="flex items-center gap-3 mb-2 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-white">
                      {project.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-white">{project.title}</h3>
                    <a 
                      href={project.link}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white opacity-0 transition-all duration-300 delay-100 group-hover:opacity-100 hover:bg-white/20 hover:scale-110"
                      aria-label="Ver projeto"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
