import Header from '~components/Header';
import Footer from '~components/Footer';
import Router from '~components/Router';
import { AppContextProvider } from '~context/AppContext';
import '~styles/index.css';

export default function Dashboard() {
  return (
    <AppContextProvider>
      <div className="relative flex flex-col justify-center items-center w-screen h-screen bg-primary text-primary">
        <Header />
        <Router />
        <Footer />
      </div>
    </AppContextProvider>
  );
}
