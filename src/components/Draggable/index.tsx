import { PropsWithChildren, useRef, useState, useContext } from 'react';
import { motion, Variants } from 'framer-motion';

import { AppContext } from '~context/AppContext';

const draggableVariants: Variants = {
  opened: {
    width: 512,
    height: 320,
    borderRadius: '10px',
    transition: { duration: 0.25, delayChildren: 0.25 },
  },
  closed: {
    width: 96,
    height: 96,
    borderRadius: '50px',
    transition: { duration: 0.25 },
  },
};

export default function Draggable({ children }: PropsWithChildren) {
  const { status, mode } = useContext(AppContext);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragStartHandler = () => {
    setDragging(true);
  };

  const dragEndHandler = () => {
    setDragging(false);
  };

  return (
    <>
      <div
        className="fixed pointer-events-none w-screen max-w-full h-screen"
        ref={containerRef}
      />
      <motion.div
        className="fixed bottom-12 right-12 w-24 h-24 rounded-full bg-primary text-primary ring-2 ring-secondary overflow-hidden data-[dragging=true]:cursor-pointer data-[disabled=true]:bg-secondary transition-colors duration-300"
        drag
        dragConstraints={containerRef}
        dragTransition={{ bounceStiffness: 1000, power: 0 }}
        whileDrag={{ scale: 0.8 }}
        variants={draggableVariants}
        initial={mode === 'alert' ? 'closed' : 'opened'}
        animate={mode === 'alert' ? 'closed' : 'opened'}
        data-dragging={dragging}
        data-disabled={status === 'idle' && mode === 'alert'}
        onDragStart={dragStartHandler}
        onDragEnd={dragEndHandler}
      >
        <div
          className="h-full data-[dragging=true]:pointer-events-none"
          data-dragging={dragging}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}
