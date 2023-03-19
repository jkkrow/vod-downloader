import { useContext } from 'react';

import { AppContext } from '~context/AppContext';

export default function NotFound() {
  const { status } = useContext(AppContext);

  return status === 'idle' ? (
    <div className="flex flex-col justify-center items-center gap-2 text-sm">
      <h3 className="text-3xl mb-2 font-bold">Video Not Detected</h3>
      <p className="font-medium">Play the video to start download</p>
      <p className="font-medium">Supported formats: MP4 / WebM / Ogg / MPEG</p>
    </div>
  ) : null;
}
