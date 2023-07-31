interface ProgressProps {
  size: number;
  percentage: number;
}

export default function Progress({ size, percentage }: ProgressProps) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const fontSize = size * 0.25;

  return (
    <div
      className="relative flex justify-center items-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg className="absolute w-full h-full -rotate-90">
        <circle
          className="text-tertiary"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="currentColor"
        />
        <circle
          className="text-primary transition-all"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <svg className="absolute w-full h-full">
        <text
          className="text-primary"
          x="50%"
          y="50%"
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="central"
          fill="currentColor"
          stroke="none"
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
