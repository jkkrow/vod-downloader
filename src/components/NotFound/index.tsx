interface NotFoundProps {
  heading: string;
  content?: JSX.Element;
}

export default function NotFound({ heading, content }: NotFoundProps) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full gap-2 text-base">
      <h3 className="text-2xl mb-2 font-bold">{heading}</h3>
      <div className="font-medium">{content}</div>
    </div>
  );
}
