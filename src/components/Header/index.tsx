import { useContext } from 'react';
import { motion } from 'framer-motion';

import { AppContext } from '~context/AppContext';

const navigations = [
  { href: 'discovery', name: 'Discovered' },
  { href: 'download', name: 'Download Queue' },
] as const;

export default function Header() {
  const { menu, setMenuHandler: setMenu } = useContext(AppContext);

  return (
    <header className="sticky w-full">
      <nav className="flex justify-between text-lg text-center font-semibold">
        {navigations.map(({ href, name }) => (
          <div
            key={href}
            className="relative flex justify-center w-full p-4 cursor-pointer hover:bg-hover transition-colors"
            onClick={() => setMenu(href)}
          >
            {name}
            {menu === href ? (
              <motion.div
                layoutId="header-bar"
                className="absolute bottom-0 w-full border-b-[1px] border-primary"
              />
            ) : null}
          </div>
        ))}
      </nav>
    </header>
  );
}
