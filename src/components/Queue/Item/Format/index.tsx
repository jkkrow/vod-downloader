import FileIcon from 'react:~assets/icons/file.svg';
import type { SupportedFormat } from '~types';

interface FormatProps {
  ext: SupportedFormat;
}

export default function Format({ ext }: FormatProps) {
  return (
    <div className="relative flex justify-center items-center">
      <span className="absolute translate-x-1/4 pr-1 text-sm font-medium bg-primary">
        {ext}
      </span>
      <span className="w-12 h-12">
        <FileIcon />
      </span>
    </div>
  );
}
