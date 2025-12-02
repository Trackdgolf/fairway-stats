import DispersionLabel from "./DispersionLabel";

interface FairwayDispersionProps {
  fwHit: number;
  left: number;
  right: number;
  short: number;
}

const FairwayDispersion = ({ fwHit, left, right, short }: FairwayDispersionProps) => {
  return (
    <svg viewBox="0 0 300 400" className="w-full max-w-sm mx-auto">
      <defs>
        {/* Gradient for rough/trees */}
        <linearGradient id="roughGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a472a" />
          <stop offset="100%" stopColor="#0d2818" />
        </linearGradient>
        
        {/* Fairway stripe pattern */}
        <pattern id="fairwayStripes" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(0)">
          <rect width="10" height="20" fill="#2d6a4f" />
          <rect x="10" width="10" height="20" fill="#40916c" />
        </pattern>
        
        {/* Tree gradient */}
        <radialGradient id="treeGradient">
          <stop offset="0%" stopColor="#2d6a4f" />
          <stop offset="100%" stopColor="#1a472a" />
        </radialGradient>
      </defs>
      
      {/* Background rough */}
      <rect x="0" y="0" width="300" height="400" fill="url(#roughGradient)" />
      
      {/* Trees on left */}
      <circle cx="25" cy="60" r="20" fill="url(#treeGradient)" />
      <circle cx="15" cy="100" r="18" fill="url(#treeGradient)" />
      <circle cx="30" cy="140" r="22" fill="url(#treeGradient)" />
      <circle cx="20" cy="190" r="19" fill="url(#treeGradient)" />
      <circle cx="25" cy="240" r="21" fill="url(#treeGradient)" />
      <circle cx="15" cy="290" r="17" fill="url(#treeGradient)" />
      <circle cx="28" cy="330" r="20" fill="url(#treeGradient)" />
      
      {/* Trees on right */}
      <circle cx="275" cy="70" r="20" fill="url(#treeGradient)" />
      <circle cx="285" cy="110" r="18" fill="url(#treeGradient)" />
      <circle cx="270" cy="150" r="22" fill="url(#treeGradient)" />
      <circle cx="280" cy="200" r="19" fill="url(#treeGradient)" />
      <circle cx="275" cy="250" r="21" fill="url(#treeGradient)" />
      <circle cx="285" cy="300" r="17" fill="url(#treeGradient)" />
      <circle cx="272" cy="340" r="20" fill="url(#treeGradient)" />
      
      {/* Fairway shape */}
      <path
        d="M 100 380 
           Q 80 300 70 200 
           Q 65 100 100 40
           L 120 25
           Q 150 15 180 25
           L 200 40
           Q 235 100 230 200
           Q 220 300 200 380
           Z"
        fill="url(#fairwayStripes)"
      />
      
      {/* Green at top */}
      <ellipse cx="150" cy="35" rx="45" ry="25" fill="#52b788" />
      
      {/* Flag pole */}
      <line x1="150" y1="35" x2="150" y2="10" stroke="#4a4a4a" strokeWidth="2" />
      {/* Flag */}
      <polygon points="150,10 170,18 150,26" fill="#dc3545" />
      
      {/* Tee box */}
      <rect x="130" y="370" width="40" height="20" rx="3" fill="#40916c" />
      <rect x="145" y="378" width="10" height="4" fill="#f8f9fa" rx="1" />
      
      {/* Dispersion Labels */}
      <DispersionLabel percentage={fwHit} label="FW HIT" x={150} y={200} />
      <DispersionLabel percentage={left} label="LEFT" x={45} y={200} />
      <DispersionLabel percentage={right} label="RIGHT" x={255} y={200} />
      {short > 0 && <DispersionLabel percentage={short} label="SHORT" x={150} y={350} />}
    </svg>
  );
};

export default FairwayDispersion;
