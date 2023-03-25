import { useContext } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import Spinner from '~components/Spinner';
import DownloadIcon from 'react:~assets/icons/download.svg';
import { AppContext } from '~context/AppContext';

const alertVariants: Variants = {
  opened: { opacity: 1, transition: { duration: 0.25, delay: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0 } },
};

const iconVariants: Variants = {
  active: {
    scale: [1, 1.1, 1],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 2 },
  },
  inActive: {
    scale: 1,
  },
};

export default function Alert() {
  const { status, loading, mode, toggleMode } = useContext(AppContext);

  return (
    <AnimatePresence>
      {mode === 'alert' ? (
        <motion.button
          className="relative flex justify-center items-center w-full h-full transition-colors"
          variants={alertVariants}
          initial="closed"
          animate="opened"
          onClick={toggleMode}
        >
          <motion.div
            className="w-12 h-12"
            variants={iconVariants}
            initial="inActive"
            animate={status === 'pending' ? 'active' : 'inActive'}
          >
            <DownloadIcon />
          </motion.div>
          <Spinner on={loading} size={40} overlay />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
