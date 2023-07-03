import FileIcon from 'react:~assets/icons/file.svg';
import type { SupportedFormat } from '~types/format';

interface FormatProps {
  format: SupportedFormat;
}

export default function Format({ format }: FormatProps) {
  return (
    <div className="relative flex justify-center items-center">
      <span className="absolute translate-x-1/4 pr-1 text-sm font-semibold tracking-widest bg-primary">
        {format}
      </span>
      <span className="w-12 h-12">
        <FileIcon />
      </span>
    </div>
  );
}
