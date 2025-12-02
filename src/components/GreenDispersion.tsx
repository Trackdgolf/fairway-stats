import DispersionLabel from "./DispersionLabel";

interface GreenDispersionProps {
  onGreen: number;
  long: number;
  left: number;
  right: number;
  short: number;
}

const GreenDispersion = ({ onGreen, long, left, right, short }: GreenDispersionProps) => {
  return (
    <svg viewBox="0 0 300 350" className="w-full max-w-sm mx-auto">
      <defs>
        {/* Gradient for rough */}
        <linearGradient id="greenRoughGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a472a" />
          <stop offset="100%" stopColor="#0d2818" />
        </linearGradient>
        
        {/* Green surface gradient */}
        <radialGradient id="greenSurface" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#52b788" />
          <stop offset="100%" stopColor="#40916c" />
        </radialGradient>
        
        {/* Bunker gradient */}
        <radialGradient id="bunkerGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#f5deb3" />
          <stop offset="100%" stopColor="#d4b896" />
        </radialGradient>
        
        {/* Tree gradient */}
        <radialGradient id="greenTreeGradient">
          <stop offset="0%" stopColor="#2d6a4f" />
          <stop offset="100%" stopColor="#1a472a" />
        </radialGradient>
      </defs>
      
      {/* Background rough */}
      <rect x="0" y="0" width="300" height="350" fill="url(#greenRoughGradient)" />
      
      {/* Trees around edges */}
      <circle cx="30" cy="40" r="25" fill="url(#greenTreeGradient)" />
      <circle cx="270" cy="50" r="23" fill="url(#greenTreeGradient)" />
      <circle cx="20" cy="175" r="22" fill="url(#greenTreeGradient)" />
      <circle cx="280" cy="180" r="24" fill="url(#greenTreeGradient)" />
      <circle cx="35" cy="310" r="26" fill="url(#greenTreeGradient)" />
      <circle cx="265" cy="315" r="22" fill="url(#greenTreeGradient)" />
      
      {/* Fringe/collar around green */}
      <ellipse cx="150" cy="175" rx="105" ry="90" fill="#3a8a5c" />
      
      {/* Main green surface - kidney/oval shape */}
      <ellipse cx="150" cy="175" rx="90" ry="75" fill="url(#greenSurface)" />
      
      {/* Bunkers */}
      <ellipse cx="70" cy="140" rx="20" ry="15" fill="url(#bunkerGradient)" />
      <ellipse cx="230" cy="150" rx="18" ry="14" fill="url(#bunkerGradient)" />
      <ellipse cx="150" cy="270" rx="25" ry="12" fill="url(#bunkerGradient)" />
      
      {/* Flag pole */}
      <line x1="150" y1="175" x2="150" y2="135" stroke="#4a4a4a" strokeWidth="2" />
      {/* Flag */}
      <polygon points="150,135 175,145 150,155" fill="#dc3545" />
      {/* Hole */}
      <circle cx="150" cy="175" r="4" fill="#1a1a1a" />
      
      {/* Dispersion Labels */}
      <DispersionLabel percentage={onGreen} label="ON GREEN" x={150} y={175} />
      {long > 0 && <DispersionLabel percentage={long} label="LONG" x={150} y={55} />}
      <DispersionLabel percentage={left} label="LEFT" x={40} y={175} />
      <DispersionLabel percentage={right} label="RIGHT" x={260} y={175} />
      <DispersionLabel percentage={short} label="SHORT" x={150} y={310} />
    </svg>
  );
};

export default GreenDispersion;
