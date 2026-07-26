import { motion } from "framer-motion";

export default function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="orb orb-1"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="orb orb-2"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}