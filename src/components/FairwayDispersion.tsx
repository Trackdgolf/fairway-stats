import fairwayImage from "@/assets/fairway-dispersion.png";

interface FairwayDispersionProps {
  fwHit: number;
  left: number;
  right: number;
  short: number;
}

const DispersionLabel = ({ 
  percentage, 
  label 
}: { 
  percentage: number; 
  label: string;
}) => (
  <div className="bg-black/75 rounded-lg px-3 py-2 text-center min-w-[64px]">
    <div className="text-white font-bold text-base">{percentage}%</div>
    <div className="text-white/80 text-[9px] font-medium uppercase">{label}</div>
  </div>
);

const FairwayDispersion = ({ fwHit, left, right, short }: FairwayDispersionProps) => {
  return (
    <div className="relative w-full">
      <img 
        src={fairwayImage} 
        alt="Fairway dispersion" 
        className="w-full h-auto rounded-lg"
      />
      
      {/* FW HIT - Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DispersionLabel percentage={fwHit} label="FW HIT" />
      </div>
      
      {/* LEFT */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <DispersionLabel percentage={left} label="LEFT" />
      </div>
      
      {/* RIGHT */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <DispersionLabel percentage={right} label="RIGHT" />
      </div>
      
      {/* SHORT */}
      {short > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <DispersionLabel percentage={short} label="SHORT" />
        </div>
      )}
    </div>
  );
};

export default FairwayDispersion;
