import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Target, Crosshair } from "lucide-react";

interface ImpactLaw {
  id: string;
  name: string;
  category: string;
  impactFactor: string;
  explanation: string;
  onCourse: string;
  diagnose: string;
}

const impactLaws: ImpactLaw[] = [
  {
    id: "BFL-01",
    name: "Face Angle at Impact",
    category: "Direction",
    impactFactor: "~75% of start direction",
    explanation: "The direction the clubface is pointing at the exact moment it contacts the ball. This single factor accounts for roughly 75% of where the ball starts its flight — far more influential than where the club is swinging. If your face is open (pointing right of the swing path) the ball will start right and curve further right. If it is closed (pointing left of the path) the ball starts left and curves further left. The old teaching that the ball starts on the swing path is simply incorrect.",
    onCourse: "Almost every slice, hook, push, or pull traces back primarily to face angle. If your ball consistently starts right of target, your face is open at impact. Fixing the face angle is nearly always more productive than changing your swing path. Tour professionals obsessively manage their face angle — it is the number one differentiator between their ball flight and an amateur's.",
    diagnose: "Watch where your ball starts, not where it finishes. If it starts right of your target line, your face was open. If it starts left, your face was closed. Use foot spray on the face to see exactly where on the face you are striking, and observe the pattern over 10 shots.",
  },
  {
    id: "BFL-02",
    name: "Swing Path",
    category: "Direction",
    impactFactor: "~25% of start direction / controls curve",
    explanation: "The direction the clubhead is travelling through the impact zone — measured horizontally. Path is expressed as in-to-out (right for a right-hander), out-to-in (left), or square. Crucially, path primarily controls the curvature of the shot rather than its start direction. The ball curves AWAY from the path: an out-to-in path with an open face produces a slice; the same path with a closed face produces a pull. The bigger the difference between face angle and path, the greater the curve.",
    onCourse: "Many golfers try to fix a slice by swinging more to the left. This actually makes the problem worse by increasing the face-to-path difference. The correct fix for a slice is usually to close the face, not change the path. Understanding that path controls curve — not start direction — completely changes how you should approach your swing fixes.",
    diagnose: "Stand behind your ball flight and watch the initial curve direction after the ball leaves the club. If it curves right, your path is left of your face angle. If it curves left, your path is right of your face angle. A divot angle also reveals path direction very clearly.",
  },
  {
    id: "BFL-03",
    name: "Face-to-Path Relationship",
    category: "Direction / Curvature",
    impactFactor: "Determines all curvature",
    explanation: "The relative difference between where the face points and where the club is swinging — this is the master control for shot shape. A face that is open TO the path produces a fade or slice. A face that is closed TO the path produces a draw or hook. A face that matches the path produces a straight shot. The key word is to — it is not about where either the face or path points in absolute terms, but how they relate to each other. The greater the difference in degrees, the more the ball will curve.",
    onCourse: "This single concept explains every curved shot in golf. A player can swing out-to-in AND hit a draw if their face is closed enough to that path. This is why two players with completely different swing paths can produce the same ball flight — because it is always the face-to-path relationship that ultimately shapes the shot.",
    diagnose: "After every wayward shot, ask two questions: where did the ball start? — that tells you roughly where your face was pointing. Which way did it curve? — that tells you which side of the face your path was on. Knowing both answers tells you exactly what to change.",
  },
  {
    id: "BFL-04",
    name: "Sweet Spot Strike",
    category: "Distance / Direction",
    impactFactor: "Single biggest factor for amateurs",
    explanation: "Where on the clubface the ball makes contact — described by Adam Young as the single biggest factor in amateur golf and the one common denominator among all tour professionals. The sweet spot is typically the centre of the grooved area, around the 3rd to 5th groove from the bottom. Striking above produces higher, lower-spin shots. Striking below produces lower, higher-spin shots. Heel strikes start left with fade spin; toe strikes start right with draw spin. All off-centre strikes lose significant energy, producing shorter, less predictable shots.",
    onCourse: "Off-centre strikes are the primary reason amateurs hit the ball shorter and more inconsistently than they should. A mis-hit of even half an inch from the sweet spot can cost 10–20 yards and alter the ball's direction and curve. Tour professionals do not hit the ball harder than good amateurs — they hit the sweet spot far more consistently. Improving face contact is the fastest way to increase distance and accuracy without changing your swing.",
    diagnose: "Mark the back of a golf ball with a dry-erase marker dot and line it up to face the club. Hit the shot — the dot transfers to your clubface showing exactly where contact was made. Repeat 10 shots and observe the pattern. Alternatively use foot spray or impact tape on the face.",
  },
  {
    id: "BFL-05",
    name: "Ground Contact",
    category: "Distance / Consistency",
    impactFactor: "Biggest distance killer for amateurs",
    explanation: "Where in the swing arc the club first contacts the ground, relative to the ball. For irons, the club should strike the ball first, then the turf — producing a divot that starts at or just beyond the ball position. Striking the ground before the ball is catastrophic for distance: hitting one inch behind the ball loses approximately 10 yards; hitting two inches behind loses up to 36 yards. Ground contact quality is the leading cause of why 94% of amateur approach shots finish short of the target.",
    onCourse: "Poor ground contact is the most under-diagnosed problem in amateur golf. Most players blame their swing plane or grip when the real issue is simply striking the ground in the wrong place. A player who strikes 2 inches behind the ball with their 7-iron will hit it the same distance as a good player hits a 9-iron. Improving ground contact alone — without any other swing change — will add 20–40 yards to approach shots.",
    diagnose: "After each iron shot, look at where your divot starts. If the divot starts behind the ball position, your low point is too far back. The divot should start at or just forward of where the ball was sitting. A useful drill: draw a line in the turf and practice hitting shots where the club contacts the turf on or just past the line.",
  },
  {
    id: "BFL-06",
    name: "Angle of Attack",
    category: "Trajectory / Distance",
    impactFactor: "Controls launch and distance",
    explanation: "The vertical angle at which the club is travelling as it reaches the ball — either descending (negative, as with irons), level, or ascending (positive, as with a driver). With irons, a slightly descending angle of attack compresses the ball and produces a controlled trajectory. With a driver, an ascending angle of attack reduces spin and increases carry distance significantly. Angle of attack contributes around 30% of launch angle — the remaining 70% comes from dynamic loft at impact.",
    onCourse: "Amateur golfers most commonly try to help the ball into the air by scooping upward through impact — which actually increases loft, adds spin, and reduces distance. With irons, the correct feel is to strike down and through the ball, trusting the loft to get it airborne. With driver, teeing the ball higher and positioning it forward in the stance promotes a natural upward strike. The difference between a driver struck at -2° and +4° angle of attack can be 20+ yards of carry.",
    diagnose: "Observe your divot depth and position for irons — a shallow, forward divot indicates a correct descending angle of attack. A deep divot behind the ball suggests too steep an angle. For driver, a high-spinning balloon shot often means you are hitting down on the ball. Try teeing it higher and moving the ball forward in your stance.",
  },
  {
    id: "BFL-07",
    name: "Dynamic Loft & Spin Loft",
    category: "Trajectory / Spin / Distance",
    impactFactor: "Controls ball height and spin rate",
    explanation: "Dynamic loft is the actual loft presented to the ball at impact — which differs from the club's stated loft depending on how much shaft lean is applied. Shaft lean forward reduces dynamic loft, producing lower, more piercing flight. Spin loft is the difference between the angle of attack and dynamic loft — and it is the primary driver of spin rate. A larger spin loft produces more spin; a smaller spin loft produces less spin and more distance. For drivers, reducing spin loft produces longer, lower-spinning shots. For wedges, higher spin loft produces high, checking shots.",
    onCourse: "This law explains why the same golfer can hit a driver 280 yards one day and 240 the next without feeling like they swung differently — small changes in dynamic loft dramatically affect spin rate and carry distance. Understanding spin loft helps players make sense of launch monitor data and explains why ball speed alone does not predict distance — spin rate matters just as much.",
    diagnose: "Notice the peak height of your shots. If your drives balloon high and come up short, your spin loft is too high — likely caused by a steep angle of attack combined with scooping. If your irons fly too low and run out, your dynamic loft may be too low. On a launch monitor, check your spin rate: for a 7-iron 6,000–7,000 rpm is typical; for a driver 2,000–2,800 rpm is ideal for most amateurs.",
  },
  {
    id: "BFL-08",
    name: "Ball Speed",
    category: "Distance",
    impactFactor: "Primary distance determinant",
    explanation: "How fast the ball leaves the clubface — the primary determinant of maximum carry distance. Ball speed is a product of club head speed multiplied by smash factor, the efficiency of energy transfer from club to ball. A perfect strike on the sweet spot achieves maximum smash factor, typically around 1.48–1.50 for a driver. An amateur with 85mph of club head speed can generate around 115mph ball speed on average, rising to 128mph on a perfect sweet-spot strike — a 13mph difference worth approximately 25 yards of carry.",
    onCourse: "You do not need to swing harder to hit the ball further — you need to strike it more efficiently. Most amateur golfers leave 20–30 yards of distance on the table through off-centre strikes rather than insufficient swing speed. Improving face contact and ground contact will raise ball speed without any increase in physical effort. This is why practice focused on strike quality produces faster improvement than practice focused on swing speed.",
    diagnose: "The simplest self-diagnosis is sound. A pure sweet-spot strike sounds crisp and feels effortless — a dull or heavy thud indicates poor energy transfer. Use the foot-spray drill on your driver face and note the pattern of contact over 10 balls — most golfers are surprised how inconsistent their strike location actually is.",
  },
];

const ImpactLaws = () => {
  const [openSections, setOpenSections] = useState<Record<string, Record<string, boolean>>>({});

  const toggleSection = (lawId: string, section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [lawId]: {
        ...prev[lawId],
        [section]: !prev[lawId]?.[section],
      },
    }));
  };

  return (
    <div className="space-y-4 mt-4">
      {impactLaws.map((law) => (
        <Card key={law.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">{law.name}</CardTitle>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {law.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 rounded-md bg-primary/10 px-3 py-1.5">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">{law.impactFactor}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed">{law.explanation}</p>

            <Collapsible
              open={openSections[law.id]?.onCourse}
              onOpenChange={() => toggleSection(law.id, "onCourse")}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium text-foreground hover:text-primary transition-colors py-1">
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    openSections[law.id]?.onCourse ? "rotate-180" : ""
                  }`}
                />
                On Course
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6 pt-1 pb-2">
                  {law.onCourse}
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={openSections[law.id]?.diagnose}
              onOpenChange={() => toggleSection(law.id, "diagnose")}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium text-foreground hover:text-primary transition-colors py-1">
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    openSections[law.id]?.diagnose ? "rotate-180" : ""
                  }`}
                />
                <div className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  How to Diagnose
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6 pt-1 pb-2">
                  {law.diagnose}
                </p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ImpactLaws;
