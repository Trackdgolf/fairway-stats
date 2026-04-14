import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BallFlight {
  name: string;
  face: "Open" | "Square" | "Closed";
  path: "Out-to-In" | "Square" | "In-to-Out";
  startDirection: string;
  curve: string;
  description: string;
}

const flights: BallFlight[] = [
  { name: "Straight", face: "Square", path: "Square", startDirection: "At target", curve: "None", description: "The holy grail — square face and square path produce a shot that starts and stays on line." },
  { name: "Fade", face: "Square", path: "Out-to-In", startDirection: "Left of target", curve: "Curves right", description: "A controlled left-to-right shot. The path is left of the face, creating cut spin." },
  { name: "Draw", face: "Square", path: "In-to-Out", startDirection: "Right of target", curve: "Curves left", description: "A controlled right-to-left shot. The path is right of the face, creating draw spin." },
  { name: "Pull", face: "Closed", path: "Out-to-In", startDirection: "Left", curve: "Straight left", description: "Face and path are both aimed left and aligned with each other — the ball goes straight left." },
  { name: "Push", face: "Open", path: "In-to-Out", startDirection: "Right", curve: "Straight right", description: "Face and path are both aimed right and aligned — the ball goes straight right." },
  { name: "Slice", face: "Open", path: "Out-to-In", startDirection: "Left of target", curve: "Big curve right", description: "The most common miss. Open face relative to an out-to-in path creates heavy left-to-right spin." },
  { name: "Hook", face: "Closed", path: "In-to-Out", startDirection: "Right of target", curve: "Big curve left", description: "Closed face relative to an in-to-out path creates heavy right-to-left spin." },
  { name: "Pull Hook", face: "Closed", path: "Out-to-In", startDirection: "Left", curve: "Curves further left", description: "Starts left due to closed face and curves more left — the face is closed to the already-left path." },
  { name: "Push Slice", face: "Open", path: "In-to-Out", startDirection: "Right", curve: "Curves further right", description: "Starts right due to open face and curves more right — the face is open to the already-right path." },
];

const faceColor = { Open: "text-destructive", Square: "text-success", Closed: "text-primary" };
const pathColor = { "Out-to-In": "text-destructive", Square: "text-success", "In-to-Out": "text-primary" };

const FacePathDiagram = ({ face, path }: { face: BallFlight["face"]; path: BallFlight["path"] }) => {
  const faceAngle = face === "Open" ? 15 : face === "Closed" ? -15 : 0;
  const pathAngle = path === "Out-to-In" ? -20 : path === "In-to-Out" ? 20 : 0;

  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Target line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
      {/* Club face */}
      <div
        className="absolute top-1/2 left-1/2 w-8 h-1 rounded-full bg-primary origin-center -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, -50%) rotate(${faceAngle}deg)` }}
      />
      {/* Swing path arrow (SVG) */}
      <svg
        className="absolute top-1/2 left-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 64 64"
        style={{ transform: `translate(-50%, -50%) rotate(${pathAngle}deg)` }}
      >
        <defs>
          <marker id={`arrowhead-${face}-${path}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" className="fill-destructive/70" />
          </marker>
        </defs>
        <line
          x1="32" y1="56" x2="32" y2="8"
          className="stroke-destructive/60"
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${face}-${path})`}
        />
      </svg>
      {/* Labels */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">Target</span>
      <span className="absolute bottom-0 left-0 text-[10px] text-primary font-medium">Face</span>
      <span className="absolute bottom-0 right-0 text-[10px] text-destructive/70 font-medium">Path</span>
    </div>
  );
};

const BallFlightLaws = () => {
  return (
    <div className="space-y-4">
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">The two key factors:</strong> The club face determines where the ball{" "}
            <em>starts</em>, and the difference between face angle and swing path determines how the ball{" "}
            <em>curves</em>.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {flights.map((flight) => (
          <Card key={flight.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{flight.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-start">
                <FacePathDiagram face={flight.face} path={flight.path} />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-3 text-xs">
                    <span>Face: <strong className={faceColor[flight.face]}>{flight.face}</strong></span>
                    <span>Path: <strong className={pathColor[flight.path]}>{flight.path}</strong></span>
                  </div>
                  <p className="text-sm text-muted-foreground">{flight.description}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Starts: {flight.startDirection}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {flight.curve}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BallFlightLaws;
