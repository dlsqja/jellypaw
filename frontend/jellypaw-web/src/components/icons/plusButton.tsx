interface PlusButtonProps {
  width?: number | string;
  height?: number | string;
  buttonColor?: string;
  plusColor?: string;
}

function PlusButton({ width = 80, height = 80, buttonColor = '#6ABFB8', plusColor = '#FAFAFA' }: PlusButtonProps) {
  const uniqueId = `filter0_dd_84_475_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter={`url(#${uniqueId})`}>
        <path d="M12 30C12 14.536 24.536 2 40 2C55.464 2 68 14.536 68 30C68 45.464 55.464 58 40 58C24.536 58 12 45.464 12 30Z" fill={buttonColor} />
        <path d="M38.54 29V23H40.46V29H46.22V31H40.46V37H38.54V31H32.78V29H38.54Z" fill={plusColor} />
      </g>
      <defs>
        <filter id={uniqueId} x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect1_dropShadow_84_475" />
          <feOffset dy="10" />
          <feGaussianBlur stdDeviation="7.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_84_475" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect2_dropShadow_84_475" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_84_475" result="effect2_dropShadow_84_475" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_84_475" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export default PlusButton;
