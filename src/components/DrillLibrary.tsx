import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Clock, Target } from "lucide-react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Drill {
  id: string;
  title: string;
  difficulty: Difficulty;
  targetHdcp: string;
  equipment: string;
  durationMins: number;
  description: string;
  coachingCue: string;
}

interface DrillCategory {
  category: string;
  drills: Drill[];
}

const difficultyColor: Record<Difficulty, string> = {
  Beginner: "bg-success text-success-foreground",
  Intermediate: "bg-warning text-warning-foreground",
  Advanced: "bg-destructive text-destructive-foreground",
};

const drillData: DrillCategory[] = [
  {
    category: "Putting",
    drills: [
      {
        id: "PUT-001",
        title: "Gate Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "2 tee pegs",
        durationMins: 10,
        description: "Push two tee pegs into the green just wider than your putter head, roughly 3 feet from the hole. Make 10 putts in a row through the gate. If you clip a tee, start your count again. Move to 6 feet once you can complete the challenge.",
        coachingCue: "Keep your eyes over the ball and stroke through the gate, not at it.",
      },
      {
        id: "PUT-002",
        title: "Clock Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "4 balls, tee pegs",
        durationMins: 15,
        description: "Place 4 balls around the hole at 3 feet, positioned like numbers on a clock — 3, 6, 9, and 12 o'clock. Hole all 4 in succession without missing. Once complete, move all balls back to 4 feet and repeat. This builds confidence from all angles.",
        coachingCue: "Pick your line, commit fully, and accelerate through impact on every putt.",
      },
      {
        id: "PUT-003",
        title: "Ladder Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "5 balls, tee pegs",
        durationMins: 15,
        description: "Place tee pegs at 10, 20, 30, 40, and 50 feet from the hole. Putt one ball from each distance in order, trying to finish within 3 feet of the hole each time. This drill trains distance control across all putt lengths.",
        coachingCue: "Focus on tempo and pendulum rhythm — a smooth stroke is more repeatable than a forced one.",
      },
      {
        id: "PUT-004",
        title: "Coin Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Coin or small sticker",
        durationMins: 10,
        description: "Place a coin or small sticker on the green and attempt to roll your putt so it comes to rest touching or on top of the coin from 6 feet. This extreme precision drill sharpens your focus on strike quality and starting line.",
        coachingCue: "Hit the sweet spot of the putter face every time — a centred strike rolls the ball true.",
      },
      {
        id: "PUT-005",
        title: "String Line Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "String or chalk line, 2 pegs",
        durationMins: 10,
        description: "Stretch a string or chalk line from behind the ball to just over the hole on a straight putt. Set up so the string runs directly down the centre of your putter face. Make 20 putts, using the line to verify your face is square at address and your ball rolls on the intended line.",
        coachingCue: "If the ball tracks left or right of the string, your face is open or closed at impact — adjust until it rolls dead straight.",
      },
      {
        id: "PUT-006",
        title: "One-Handed Putting",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Putter only",
        durationMins: 10,
        description: "Using only your lead hand (left for right-handers), make 20 putts from 6 feet. Then switch to your trail hand only for 20 more. This drill isolates each hand's role in the stroke, improving feel and exposing any dominant-hand overuse.",
        coachingCue: "The lead hand controls direction; the trail hand controls pace. Feel the difference.",
      },
      {
        id: "PUT-007",
        title: "Eyes Closed Drill",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Putter only",
        durationMins: 10,
        description: "Set up to a putt from 4 feet. Close your eyes before you stroke and keep them closed through impact and follow-through. Listen for the ball to drop. This builds a feel-based stroke, reducing mechanical overthinking and improving tempo.",
        coachingCue: "Trust your rehearsal stroke — what you feel in practice is what you execute on the course.",
      },
      {
        id: "PUT-008",
        title: "3-6-9 Pressure Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "3 balls, tee pegs",
        durationMins: 15,
        description: "Place balls at 3, 6, and 9 feet from the hole. You must hole all three consecutively to complete the drill. If you miss any putt, start again from 3 feet. This replicates on-course pressure and builds a clutch putting routine.",
        coachingCue: "Slow your routine down when the pressure is on — take an extra breath before pulling the trigger.",
      },
    ],
  },
  {
    category: "Driving",
    drills: [
      {
        id: "DRV-001",
        title: "Alignment Stick Tee Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Alignment stick, driver",
        durationMins: 15,
        description: "Lay an alignment stick along the ground parallel to your target line, just outside the ball. Hit 15 drives, checking that your feet, hips, and shoulders are all parallel to the stick. Poor alignment is the most common cause of missed fairways.",
        coachingCue: "Aim the clubface first, then build your body alignment around it — not the other way round.",
      },
      {
        id: "DRV-002",
        title: "Tee Height Experiment",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Tees of different heights, driver",
        durationMins: 15,
        description: "Hit 5 drives with the ball teed low (half the ball above the clubhead), 5 teed standard (equator at crown height), and 5 teed high (full ball above crown). Note which height produces the straightest, most consistent contact and adopt it as your standard.",
        coachingCue: "Higher tee equals more upward angle of attack equals less spin and more carry. Find what works for your swing.",
      },
      {
        id: "DRV-003",
        title: "Glove Under Lead Arm",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Glove or headcover, driver",
        durationMins: 15,
        description: "Tuck a glove or small headcover under your lead armpit (left armpit for right-handers) and hold it there throughout your swing. If it drops during the backswing or downswing, your arm connection is breaking down. Hit 20 drives keeping it in place.",
        coachingCue: "The glove staying in place means your arms and body are rotating together — the key to a consistent strike.",
      },
      {
        id: "DRV-004",
        title: "Feet Together Balance Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Driver",
        durationMins: 10,
        description: "Stand with your feet touching each other and hit 10 drives at 60% effort. You cannot swing hard without falling over, which forces you to find the centre of your swing arc. This drill rapidly improves balance, tempo, and centred contact.",
        coachingCue: "If you fall off balance, you're swinging too hard. Let the club do the work.",
      },
      {
        id: "DRV-005",
        title: "Tempo 3:1 Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Driver",
        durationMins: 15,
        description: "Count 1-2-3 on your backswing and 1 on your downswing, creating a 3:1 backswing-to-downswing tempo ratio. Hit 15 drives using this count out loud. Tour players' tempos vary but almost all maintain a consistent 3:1 ratio regardless of swing speed.",
        coachingCue: "Rushing the downswing is the number one cause of a slice. A slower transition keeps the club on plane.",
      },
      {
        id: "DRV-006",
        title: "Impact Bag Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Impact bag or old bag of grass cuttings",
        durationMins: 10,
        description: "Place an impact bag or stuffed duffel bag where the ball would be. Swing into it at medium pace, focusing on having your hands ahead of the bag at the moment of contact. Hold your finish and check your lead wrist is flat, not cupped.",
        coachingCue: "Hands ahead of the ball at impact is the single most important position for straight, powerful driving.",
      },
      {
        id: "DRV-007",
        title: "Half-Speed Accuracy Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Driver, alignment sticks or towels as targets",
        durationMins: 15,
        description: "Place two alignment sticks 20 yards apart to represent a fairway. Hit 15 drives at half your normal swing speed, focusing entirely on hitting between the sticks. Gradually increase speed only when you can hit 10 of 15 in the target zone.",
        coachingCue: "Accuracy comes before speed. Build the pattern at half pace, then turn up the volume.",
      },
      {
        id: "DRV-008",
        title: "Tee Drill — Swing Path",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "4 tees, driver",
        durationMins: 15,
        description: "Push 4 tees into the ground to create a box just larger than your clubhead: one tee at the back-outside, one at the front-inside, and two at the sides. Swing through the box without knocking the inside-back tee, which trains an inside-out swing path and eliminates the over-the-top move that causes slices.",
        coachingCue: "If you knock the back-outside tee, your path is over the top. If you clip the front-inside tee, you are swinging too far in-to-out.",
      },
    ],
  },
  {
    category: "Approach Play",
    drills: [
      {
        id: "APP-001",
        title: "Towel Under Arms Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Small towel, 7-iron",
        durationMins: 15,
        description: "Fold a small towel and hold it between your upper arms and your chest throughout your iron swing. Hit 20 balls without the towel falling. This drills the connected, body-driven swing that leads to consistent strike and distance control on approach shots.",
        coachingCue: "When your arms separate from your body, your strike becomes inconsistent. Stay connected.",
      },
      {
        id: "APP-002",
        title: "Divot Pattern Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "7-iron, chalk or foot spray",
        durationMins: 10,
        description: "Spray foot spray or chalk on the club face of your 7-iron. Hit 10 shots from the turf and check where the marks appear on the face. Heel strikes produce hooks and short shots; toe strikes produce fades and thin contact. The goal is a consistent pattern centred on the sweet spot.",
        coachingCue: "The divot should start at the ball and extend forward — ball first, then turf. Never turf first.",
      },
      {
        id: "APP-003",
        title: "Yardage Gapping Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Full iron set, range finder or app",
        durationMins: 20,
        description: "On the range, hit 5 shots with each iron from your 9-iron to your 5-iron and record the average carry distance for each. Identify any gaps of more than 15 yards between clubs. Knowing your exact distances is essential for attacking pins rather than guessing.",
        coachingCue: "Most amateurs overestimate how far they hit each club by 10-20%. Measure carry, not roll.",
      },
      {
        id: "APP-004",
        title: "9-Shot Shape Drill",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "7-iron",
        durationMins: 20,
        description: "Hit 9 deliberate shots with your 7-iron: 3 low draws, 3 straight at medium height, and 3 high fades. This is the classic Ben Hogan drill. The ability to vary trajectory and shape on demand is what separates low handicappers from mid-handicappers on approach shots.",
        coachingCue: "To hit low: ball back in stance, hands forward, abbreviated follow through. To hit high: ball forward, widen the arc.",
      },
      {
        id: "APP-005",
        title: "Hula Hoop Target Practice",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Hula hoop or 6-foot circle marker, mid-irons",
        durationMins: 20,
        description: "Place a hula hoop or mark a 6-foot circle on the range at your target distance. Hit 20 approach shots at 100, 125, and 150 yards, counting how many land inside the circle. This quantifies your approach accuracy and tracks improvement over time.",
        coachingCue: "Visualise landing the ball in the circle before each shot — commitment to a precise target improves accuracy.",
      },
      {
        id: "APP-006",
        title: "Punch Shot Control",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "7-iron, 8-iron",
        durationMins: 15,
        description: "Hit 15 controlled punch shots with a 7-iron, limiting your follow-through to hip height. The ball should fly low and straight with a penetrating trajectory. This shot is invaluable in wind and also trains the hands-first impact position needed for crisp ball-striking.",
        coachingCue: "Lean the shaft forward at address, keep the swing compact, and let your body rotation control the shot.",
      },
      {
        id: "APP-007",
        title: "Pre-Shot Routine Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Any iron, alignment stick",
        durationMins: 15,
        description: "Build a repeatable pre-shot routine: stand behind the ball and pick your target, walk in from behind, set the clubface first, then your feet, take one practice swing, look at the target twice, and go. Hit 20 shots using exactly this routine on every shot. Consistency in routine breeds consistency in execution.",
        coachingCue: "Your pre-shot routine is your reset button. The same routine every time removes indecision.",
      },
      {
        id: "APP-008",
        title: "Choke Down Accuracy Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "6-iron",
        durationMins: 10,
        description: "Grip down 2 inches on a 6-iron and hit 15 controlled approach shots. Choking down reduces distance by roughly one club but dramatically improves control and strike consistency. This is a course management skill as much as a practice drill — great for tight pins.",
        coachingCue: "Choking down lowers ball flight, improves feel, and sharpens contact. Accept the distance trade-off.",
      },
    ],
  },
  {
    category: "Short Game",
    drills: [
      {
        id: "SCR-001",
        title: "Landing Zone Chipping",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Wedge, hula hoop or towel",
        durationMins: 15,
        description: "Place a towel or hula hoop 3 feet onto the green from the fringe and chip 20 balls, trying to land every shot on the towel. This trains the fundamental short game skill of controlling carry distance. Once you can land it on the towel, the ball will consistently roll out to the hole.",
        coachingCue: "Pick a specific landing spot before every chip — not the hole. Land it there and let it run.",
      },
      {
        id: "SCR-002",
        title: "Up and Down Challenge",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Wedge, putter, 5 balls",
        durationMins: 20,
        description: "Drop 5 balls in 5 different positions around the green — tight lie, rough, fringe, uphill, downhill. Play each as an up-and-down challenge, attempting to hole out in 2 shots. Score yourself out of 5. This replicates on-course scrambling scenarios and teaches shot selection under pressure.",
        coachingCue: "Before playing each shot, ask: what is the lowest-risk shot that gives me the best chance of two-putting? Don't always default to the lob wedge.",
      },
      {
        id: "SCR-003",
        title: "One-Hop-and-Stop Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Sand wedge or lob wedge",
        durationMins: 15,
        description: "From just off the green on a tight lie, practice playing a pitch shot that lands once and stops dead within 2 feet of its landing spot. This requires precise control of spin and loft. The goal is 10 of 20 shots stopping within 2 feet of their landing mark.",
        coachingCue: "Open the face slightly, accelerate through the ball, and keep your wrists firm. Deceleration kills spin.",
      },
      {
        id: "SCR-004",
        title: "Fringe Bump and Run",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "7-iron or 8-iron",
        durationMins: 10,
        description: "From the fringe or first cut (3–10 yards off the green), chip 20 balls with a 7-iron using a putting-style stroke. The bump-and-run is the highest percentage chip shot for amateur golfers, requiring less precision than a lob and producing more consistent results on firm ground.",
        coachingCue: "Use your putting grip, keep your weight forward, and think of it as a long putt. Don't get cute with the lob wedge from here.",
      },
      {
        id: "SCR-005",
        title: "Lob Shot Height Control",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Lob wedge",
        durationMins: 15,
        description: "Set up a barrier (alignment stick across two stands or a bag) about 3 feet in front of the ball at roughly 5 feet high. Hit 20 pitch shots that fly over the barrier and land softly on the other side. This trains the high, soft lob that is essential for short-sided scrambling.",
        coachingCue: "Open the face significantly, open your stance, make a full swing, and let the loft do the work. Trying to help the ball up kills the shot.",
      },
      {
        id: "SCR-006",
        title: "Around the Clock Chipping",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Wedge, putter, 8 balls",
        durationMins: 20,
        description: "Place 8 balls evenly around the hole at 5 yards each, like hours on a clock face. Play each chip and attempt to hole out or finish within 3 feet. Rotate the clock for different lies — tight, rough, uphill, downhill. Score yourself out of 8 to track improvement.",
        coachingCue: "Each position on the clock tests a different shot shape and trajectory. This is the most complete scrambling drill you can do.",
      },
      {
        id: "SCR-007",
        title: "Towel Distance Control",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Wedge, 3 towels",
        durationMins: 15,
        description: "Place towels at 10, 20, and 30 yards from where you are chipping. Hit 5 balls trying to land on each towel in rotation. This calibrates your feel for carry distances on pitches and chips, the foundation of good scrambling. Most amateurs lack distance control, not technique.",
        coachingCue: "Vary your backswing length to control distance — not your wrist hinge or swing speed.",
      },
      {
        id: "SCR-008",
        title: "Deliberate Miss Drill",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Wedge set",
        durationMins: 15,
        description: "From greenside, deliberately aim for a spot 6 feet past the hole and try to stop the ball at the hole using spin. Then aim 6 feet short and try to carry it to the hole. This trains feel for spin, pace, and trajectory adjustment, making you adaptable when scrambling from awkward positions.",
        coachingCue: "The best scramblers are not just technically good — they read the situation and adjust. Practice improvising.",
      },
    ],
  },
  {
    category: "Up & Down",
    drills: [
      {
        id: "UAD-001",
        title: "The 50-Ball Up and Down Test",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Full wedge set, putter",
        durationMins: 30,
        description: "Drop 10 balls each at 5 different greenside positions: right-side tight lie, left-rough, front bunker lip, downhill chip, and back-fringe. Play each as a genuine up-and-down attempt. Record your success rate. This is the most realistic measure of your short game and tracks directly against your scrambling stat.",
        coachingCue: "Approach each ball as you would on the course — full routine, clear target, committed shot.",
      },
      {
        id: "UAD-002",
        title: "Chip and Putt Game",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Wedge, putter, 5 balls",
        durationMins: 20,
        description: "Play a simple competitive game: chip from one position, then hole the putt. Give yourself 1 point for getting up and down, 0 for failing. Play 18 holes from different positions around the green. This gamifies practice and replicates the decision-making pressure of real scrambling situations.",
        coachingCue: "Treat every chip like it matters. Casual chip practice does not translate to pressure on the course.",
      },
      {
        id: "UAD-003",
        title: "Bunker Par Save Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Sand wedge, bunker",
        durationMins: 20,
        description: "Hit 20 bunker shots from a flat lie at 15 yards to a target with a tight back pin. Attempt to hole out or finish within 5 feet for a realistic par save. The majority of amateur up-and-down failures come from poor bunker play. Getting out reliably and close is a game-changer.",
        coachingCue: "Enter the sand 2 inches behind the ball, keep the face open, and follow through fully. The sand does the work.",
      },
      {
        id: "UAD-004",
        title: "Pressure Putting After Chips",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Wedge, putter",
        durationMins: 15,
        description: "Chip a ball from 10 yards to the green. Wherever it finishes, you must hole the putt to complete the up-and-down. If you miss, start the hole over. This combination drill trains the full up-and-down sequence under simulated pressure, with your chip result directly affecting your next challenge.",
        coachingCue: "The putt after a chip requires immediate focus reset. Forget the chip — it is done. See the line of the putt.",
      },
      {
        id: "UAD-005",
        title: "3-Club Short Game Challenge",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "3 wedges of different lofts",
        durationMins: 20,
        description: "Select three wedges (e.g. 52°, 56°, 60°). From the same position, play one shot with each club to the same pin. Compare results and note which club gave you the best chance of an up-and-down. Repeat from 5 positions. This trains intelligent club selection for scrambling situations.",
        coachingCue: "Higher loft is not always better. Match the club to the lie, the green speed, and the pin position.",
      },
      {
        id: "UAD-006",
        title: "The Worst Ball Drill",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Wedge, putter, 2 balls",
        durationMins: 20,
        description: "Play two balls from each greenside position and always play your next shot from the worse result. This forces you to get up and down from genuinely difficult positions and builds resilience and creativity. It is the ultimate short game challenge drill.",
        coachingCue: "When you are forced to play from a bad position, you discover shots you did not know you had. Embrace difficulty.",
      },
      {
        id: "UAD-007",
        title: "Variable Lie Chipping",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Sand wedge, lob wedge",
        durationMins: 15,
        description: "Using a rake, create 10 different lies around the practice green: tight, fluffy rough, buried, downhill, uphill, and sidehill. Play each lie with the most appropriate wedge and assess the result. Poor up-and-down conversion often comes from being unable to handle varied lies, not poor technique.",
        coachingCue: "Adjust your ball position and face angle based on the lie before you think about the target.",
      },
      {
        id: "UAD-008",
        title: "The Make-or-Miss Game",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Putter, 6 balls",
        durationMins: 10,
        description: "Place 6 balls at 4 feet from the hole in a semicircle. You must hole all 6 consecutively. If you miss, start again. This drill builds the short putting confidence that is essential for converting up-and-downs. Most missed up-and-downs are lost on the green, not with the chip.",
        coachingCue: "Slow your stroke on short putts — most misses at 4 feet are caused by rushing, not misreading.",
      },
    ],
  },
  {
    category: "Course Management",
    drills: [
      {
        id: "PEN-001",
        title: "Course Management Grid",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Notepad or scoring app",
        durationMins: 20,
        description: "On your next range session, draw a simple grid of the 5 hardest holes on your home course. For each hole, write down: (1) where your penalty shots typically come from, (2) what club removes that risk, (3) what score you are targeting. Reviewing this before a round reduces impulsive decisions that lead to penalty shots.",
        coachingCue: "Most penalty strokes come from ego, not bad swings. Play the percentage shot.",
      },
      {
        id: "PEN-002",
        title: "Layup Decision Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Irons, driver, range finder",
        durationMins: 20,
        description: "On the range, identify a target 50 yards short of a notional hazard. Hit 10 shots with your intended layup club, checking that every shot stops short of the hazard line. Then assess how much closer to the green a layup leaves you vs. the risk of going for it. Quantify the real benefit of the aggressive play.",
        coachingCue: "A well-executed layup to 100 yards is worth more than a failed hero shot into water.",
      },
      {
        id: "PEN-003",
        title: "Dispersion Awareness Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Driver and irons, range, markers",
        durationMins: 20,
        description: "Hit 10 drives and 10 long iron shots, placing a marker at the furthest left and furthest right result each time. Measure the width of your dispersion cone. If your driver disperses 60 yards wide, any fairway narrower than that requires a more conservative club. This makes penalty avoidance strategic, not reactive.",
        coachingCue: "Know your dispersion before you pick your club. Most amateurs use driver by default, not by design.",
      },
      {
        id: "PEN-004",
        title: "Trouble Shot Library",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Full bag, various lies",
        durationMins: 25,
        description: "On the range, practice 5 specific recovery shots that you most frequently need: (1) punch from under trees, (2) low stinger from tight rough, (3) high escape over trees, (4) chip-out sideways to fairway, and (5) long bunker shot. Practice each until you can execute it reliably 3 times in a row.",
        coachingCue: "The best way to avoid penalty strokes is having a shot you trust when you find trouble. Practice the escape shots, not just the perfect lies.",
      },
      {
        id: "PEN-005",
        title: "Target Band Tee Shot Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Driver, 3-wood, hybrid, markers",
        durationMins: 20,
        description: "On the range, mark out a 30-yard-wide target band. Hit 5 shots each with driver, 3-wood, and hybrid, counting how many land in the band. Compare accuracy percentages across clubs. Often a hybrid or 3-wood lands in the safe zone twice as often as driver — for no real scoring difference.",
        coachingCue: "Use the tee shot that gives you the highest probability of being in play, not the one that goes furthest.",
      },
      {
        id: "PEN-006",
        title: "Water Hazard Protocol Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Mid-irons, range",
        durationMins: 15,
        description: "Identify the 3 holes on your home course where you most frequently find water. For each, decide a specific club and aim point that completely removes the water from play. Hit 10 shots with that club from the relevant distance, until you can execute the conservative play with full commitment and confidence.",
        coachingCue: "Decide your hazard strategy before the round, not on the tee box when adrenaline affects judgement.",
      },
      {
        id: "PEN-007",
        title: "Mental Pre-Round Rehearsal",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Notepad, scoring app or memory",
        durationMins: 15,
        description: "Before your next round, spend 10 minutes mentally walking the 18 holes and identifying the 5 most penalty-prone situations you face. For each, decide your exact plan — club, target, and acceptable miss direction. Research shows that players who pre-plan penalty-risk holes take significantly fewer penalties.",
        coachingCue: "Pressure reveals your defaults. Pre-planning overrides the aggressive default that causes penalty shots.",
      },
      {
        id: "PEN-008",
        title: "Aggressive vs Conservative Scoring Game",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Full bag, scorecard",
        durationMins: 90,
        description: "Play 9 holes twice in your mind (or on a par 3 course). First round: play every shot as aggressively as possible, going at every pin and taking every risk. Second round: play every shot to the safest target, accepting bogey rather than risking double. Compare the scores. Most golfers are surprised how much the conservative round scores better.",
        coachingCue: "Golf is not won by making birdies. It is won by not making doubles. Protect your scorecard.",
      },
    ],
  },
];

const difficultyOrder: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

const DrillLibrary = () => {
  const [openDrills, setOpenDrills] = useState<Record<string, boolean>>({});

  const toggleDrill = (id: string) => {
    setOpenDrills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 mt-4">
      {drillData.map((category) => (
        <div key={category.category}>
          <h2 className="text-lg font-bold text-foreground mb-3">{category.category}</h2>
          <div className="space-y-3">
            {[...category.drills].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]).map((drill) => (
              <Collapsible
                key={drill.id}
                open={openDrills[drill.id]}
                onOpenChange={() => toggleDrill(drill.id)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              openDrills[drill.id] ? "rotate-180" : ""
                            }`}
                          />
                          <CardTitle className="text-base leading-snug">{drill.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {drill.durationMins} min
                          </span>
                          <Badge className={difficultyColor[drill.difficulty]}>
                            {drill.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>

                      <div className="flex items-start gap-2 rounded-md bg-primary/10 px-3 py-2">
                        <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-primary leading-relaxed">{drill.coachingCue}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          🎯 {drill.targetHdcp} hdcp
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          🧰 {drill.equipment}
                        </span>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrillLibrary;
