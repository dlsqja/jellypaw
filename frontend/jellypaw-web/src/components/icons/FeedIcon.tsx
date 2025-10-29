interface FeedIconProps {
  fill?: string;
  stroke?: string;
  width?: number | string;
  height?: number | string;
}

function FeedIcon({ fill = '#A3A3A3', stroke = 'inherit', width = 28, height = 28 }: FeedIconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 28 28" fill="none" stroke={stroke} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24.08 23.7533C24.08 24.08 23.9718 24.3561 23.7552 24.5817C23.5387 24.8072 23.2736 24.92 22.96 24.92H5.04004C4.72644 24.92 4.46138 24.8072 4.24484 24.5817C4.02831 24.3561 3.92004 24.08 3.92004 23.7533V11.5033C3.92004 11.1144 4.06191 10.8033 4.34564 10.57L13.3056 3.31333C13.5147 3.15778 13.7462 3.08 14 3.08C14.2539 3.08 14.4854 3.15778 14.6944 3.31333L23.6544 10.57C23.9382 10.8033 24.08 11.1144 24.08 11.5033V23.7533Z"
        fill={fill}
      />
    </svg>
  );
}

export default FeedIcon;
