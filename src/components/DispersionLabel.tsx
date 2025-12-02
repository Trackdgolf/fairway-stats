interface DispersionLabelProps {
  percentage: number;
  label: string;
  x: number;
  y: number;
}

const DispersionLabel = ({ percentage, label, x, y }: DispersionLabelProps) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="-32"
        y="-20"
        width="64"
        height="40"
        rx="6"
        fill="rgba(0, 0, 0, 0.75)"
      />
      <text
        x="0"
        y="-2"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="bold"
      >
        {percentage}%
      </text>
      <text
        x="0"
        y="14"
        textAnchor="middle"
        fill="rgba(255, 255, 255, 0.8)"
        fontSize="9"
        fontWeight="500"
      >
        {label}
      </text>
    </g>
  );
};

export default DispersionLabel;
