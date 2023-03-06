import { motion } from 'framer-motion';
import { PropsWithChildren, useRef } from 'react';

export default function Draggable({ children }: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        className="absolute pointer-events-none w-screen h-screen"
        ref={containerRef}
      />
      <motion.div
        className="fixed flex items-center justify-center bottom-12 right-12 w-24 h-24 rounded-full bg-black text-white"
        drag
        dragTransition={{ bounceStiffness: 1000, power: 0 }}
        dragConstraints={containerRef}
        whileDrag={{ scale: 0.8 }}
      >
        {children}
      </motion.div>
    </>
  );
}
