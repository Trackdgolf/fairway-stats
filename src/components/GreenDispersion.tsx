import greenImage from "@/assets/green-dispersion.png";

interface GreenDispersionProps {
  onGreen: number;
  long: number;
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

const GreenDispersion = ({ onGreen, long, left, right, short }: GreenDispersionProps) => {
  return (
    <div className="relative w-full">
      <img 
        src={greenImage} 
        alt="Green dispersion" 
        className="w-full h-auto rounded-lg"
      />
      
      {/* ON GREEN - Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DispersionLabel percentage={onGreen} label="ON GREEN" />
      </div>
      
      {/* LONG - Top */}
      {long > 0 && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <DispersionLabel percentage={long} label="LONG" />
        </div>
      )}
      
      {/* LEFT */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <DispersionLabel percentage={left} label="LEFT" />
      </div>
      
      {/* RIGHT */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <DispersionLabel percentage={right} label="RIGHT" />
      </div>
      
      {/* SHORT */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <DispersionLabel percentage={short} label="SHORT" />
      </div>
    </div>
  );
};

export default GreenDispersion;
