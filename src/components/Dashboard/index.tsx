import { useContext } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import NotFound from './NotFound';
import QueueList from './Queue/List';
import Footer from './Footer';
import { AppContext } from '~context/AppContext';

const dashboardVariants: Variants = {
  opened: { opacity: 1, transition: { duration: 0.25, delay: 0.25 } },
  closed: { opacity: 0, transition: { duration: 0 } },
};

export default function Dashboard() {
  const { mode } = useContext(AppContext);

  return (
    <AnimatePresence>
      {mode === 'dashboard' ? (
        <motion.div
          className="relative flex flex-col justify-center items-center w-full h-full p-4"
          variants={dashboardVariants}
          initial="closed"
          animate="opened"
        >
          <NotFound />
          <QueueList />
          <Footer />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
