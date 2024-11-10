"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const pageVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  return (
    <>
      {isInitialLoad ? (
        <div style={{ overflow: "hidden" }}>{children}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="hidden"
            animate="visible"
            variants={pageVariants}
            style={{ overflow: "overaly", position: "relative" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default PageTransition;
