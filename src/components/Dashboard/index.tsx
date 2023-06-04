import NotFound from './NotFound';
import Queue from './Queue';
import Footer from './Footer';

export default function Dashboard() {
  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full p-4">
      <NotFound />
      <Queue />
      <Footer />
    </div>
  );
}
