import { useContext } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import MinimizeIcon from 'react:~assets/icons/minimize.svg';
import { AppContext } from '~context/AppContext';

const dashboardVariants: Variants = {
  opened: { opacity: 1, transition: { duration: 0.25, delay: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0 } },
};

export default function Dashboard() {
  const { mode, toggle } = useContext(AppContext);

  return (
    <AnimatePresence>
      {mode === 'dashboard' ? (
        <motion.div
          className="relative flex flex-col justify-center items-center w-full h-full"
          variants={dashboardVariants}
          initial="closed"
          animate="opened"
        >
          <button
            className="absolute bottom-4 right-4 w-6 h-6"
            onClick={toggle}
          >
            <MinimizeIcon />
          </button>
          <div className="flex flex-col justify-center items-center gap-2">
            <h3 className="text-3xl mb-2 font-bold">Video Not Detected</h3>
            <p className="font-medium">Play the video to start download</p>
            <p className="font-medium">
              Supported formats: MP4 / WebM / Ogg / MPEG
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
