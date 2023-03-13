import { useContext } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';

const alertVariants: Variants = {
  opened: { opacity: 1, transition: { duration: 0.25, delay: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0 } },
};

export default function Alert() {
  const { mode, toggle } = useContext(AppContext);

  return (
    <AnimatePresence>
      {mode === 'alert' ? (
        <motion.button
          className="flex justify-center items-center w-full h-full"
          variants={alertVariants}
          initial="closed"
          animate="opened"
          onClick={toggle}
        >
          <div className="w-12 h-12">
            <DownloadIcon />
          </div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
