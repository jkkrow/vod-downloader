import DownloadIcon from 'react:~assets/icons/download.svg';

interface DownloadProps {
  uri: string;
}

export default function Download({ uri }: DownloadProps) {
  const downloadHandler = () => {
    console.log(uri);
  };

  return (
    <button className="w-12 h-12 p-2 ml-auto" onClick={downloadHandler}>
      <DownloadIcon />
    </button>
  );
}
