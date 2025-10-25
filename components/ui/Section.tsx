import { motion } from "framer-motion";

export function Section({ title, description, children, delay = 0.15 }: { title: string; description?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      className="rounded-2xl w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs mt-1">{description}</p>}
        </div>
      </div>

      <div className="flex flex-col">
        {/* ensure MenuItem/ToggleItem render without cramped spacing */}
        <div className="py-1">{children}</div>
      </div>
    </motion.section>
  );
}
