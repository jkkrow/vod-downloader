import NotFound from '~components/NotFound';
import Queue from '~components/Queue';
import Footer from '~components/Footer';
import { AppContextProvider } from '~context/AppContext';
import '~styles/index.css';

export default function Dashboard() {
  return (
    <AppContextProvider>
      <div className="relative flex flex-col justify-center items-center w-screen h-screen bg-primary text-primary">
        <NotFound />
        <Queue />
        <Footer />
      </div>
    </AppContextProvider>
  );
}
