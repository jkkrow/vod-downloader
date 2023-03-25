import { AnimatePresence, motion, Variants } from 'framer-motion';

import LoaderIcon from 'react:~assets/icons/loader.svg';

const spinnerVariants: Variants = {
  active: { opacity: 1 },
  inActive: { opacity: 0 },
};

interface SpinnerProps {
  on?: boolean;
  size: number;
  overlay?: boolean;
}

export default function Spinner({ on, size, overlay }: SpinnerProps) {
  return (
    <AnimatePresence>
      {on ? (
        <motion.div
          className="flex justify-center items-center data-[overlay=true]:absolute data-[overlay=true]:inset-0 bg-primary text-primary"
          data-overlay={overlay}
          variants={spinnerVariants}
          transition={{ duration: 0.15 }}
          initial="inActive"
          animate="active"
          exit="inActive"
        >
          <LoaderIcon className="animate-spin" width={size} height={size} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
