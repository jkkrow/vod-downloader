import { useContext } from 'react';

import { AppContext } from '~context/AppContext';

export default function NotFound() {
  const { status } = useContext(AppContext);

  return status === 'idle' ? (
    <div className="flex flex-col justify-center items-center w-full h-full gap-2 text-base">
      <h3 className="text-2xl mb-2 font-bold">
        No media is detected in this tab
      </h3>
      <p className="font-medium">Play the video to start download</p>
      <p className="font-medium">Supported formats: MP4 / WebM / Ogg / MPEG</p>
    </div>
  ) : null;
}
