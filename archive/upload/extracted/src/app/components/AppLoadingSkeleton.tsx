import { motion } from "motion/react";

export const AppLoadingSkeleton = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--app-background)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-6xl mb-4"
        >
          ✨
        </motion.div>
        <h2
          className="text-xl mb-2"
          style={{ color: "var(--app-text)", fontWeight: 600 }}
        >
          Abantika
        </h2>
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          Loading your wellness companion...
        </p>
      </motion.div>
    </div>
  );
};
