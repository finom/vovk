import { motion } from "framer-motion";
import React from "react";

const loadingContainer = {
  width: "2rem",
  height: "2rem",
  display: "flex",
  justifyContent: "space-around",
};

const loadingCircle = {
  display: "block",
  width: "0.4rem",
  height: "0.4rem",
  borderRadius: "0.25rem",
};

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "50%",
  },
  end: {
    y: "150%",
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  yoyo: Infinity,
  ease: "easeInOut",
};

interface ThreeDotsWaveProps {
  colorVariable?: string; // CSS variable for background color
}

export default function ThreeDotsWave({
  colorVariable = "--card",
}: ThreeDotsWaveProps) {
  return (
    <motion.div
      style={loadingContainer}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        style={{
          ...loadingCircle,
          backgroundColor: `hsl(var(${colorVariable}))`, // Use HSL function for Tailwind CSS variables
        }}
        variants={loadingCircleVariants}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error TODO: Fix type error
        transition={loadingCircleTransition}
      />
      <motion.span
        style={{
          ...loadingCircle,
          backgroundColor: `hsl(var(${colorVariable}))`,
        }}
        variants={loadingCircleVariants}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error TODO: Fix type error
        transition={loadingCircleTransition}
      />
      <motion.span
        style={{
          ...loadingCircle,
          backgroundColor: `hsl(var(${colorVariable}))`,
        }}
        variants={loadingCircleVariants}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error TODO: Fix type error
        transition={loadingCircleTransition}
      />
    </motion.div>
  );
}
