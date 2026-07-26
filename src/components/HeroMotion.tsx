import { motion } from "framer-motion";

export default function HeroMotion() {
  return (
    <section className="hero">
      <div className="hero-blur hero-blur-1" />
      <div className="hero-blur hero-blur-2" />

      <motion.p
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        AI ENGINEERING INTERN @ CCC
      </motion.p>

      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Kian
        <br />
        Karbassian
      </motion.h1>

      <motion.p
        className="hero-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Building multimodal AI systems, agent frameworks, and
        production-grade software.
      </motion.p>

      <motion.div
        className="hero-buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <a href="#projects" className="btn-primary">
          View Work
        </a>

        <a href="/resume.pdf" className="btn-secondary">
          Resume
        </a>
      </motion.div>
    </section>
  );
}