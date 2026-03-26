import { motion } from "framer-motion";

// Client/partner logo names displayed as text badges
const logos = [
  "Google Analytics", "Meta Ads", "Stripe", "WhatsApp Business",
  "Supabase", "Vercel", "Cloudflare", "Hotmart",
  "Shopify", "Mailchimp", "Google Search Console", "Hostgator",
];

export default function ClientesSection() {
  return (
    <section className="py-12 overflow-hidden border-y border-white/5">


      {/* Infinite scroll track */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[hsl(var(--background))] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[hsl(var(--background))] to-transparent pointer-events-none" />

        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        >
          {/* Duplicate logos for seamless loop */}
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-5 py-2.5 rounded-full border border-white/8 bg-white/3 text-white/40 text-xs font-medium whitespace-nowrap hover:border-white/20 hover:text-white/60 transition-colors cursor-default"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


