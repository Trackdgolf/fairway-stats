import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PRACTICE_PLAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/practice-plan`;

const PracticePlan = () => {
  const { user } = useAuth();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const computeStats = async () => {
    const supabase = getSupabaseClient();

    const { data: rounds, error: roundsErr } = await supabase
      .from("rounds")
      .select("id")
      .eq("user_id", user!.id)
      .order("played_at", { ascending: false })
      .limit(5);

    if (roundsErr) throw roundsErr;
    if (!rounds?.length) return null;

    const roundIds = rounds.map((r) => r.id);
    const { data: holes, error: holesErr } = await supabase
      .from("hole_stats")
      .select("fir, gir, putts, scramble, par")
      .in("round_id", roundIds);

    if (holesErr) throw holesErr;
    if (!holes?.length) return null;

    // FIR% — exclude par 3s
    const firHoles = holes.filter((h) => h.par !== 3 && h.fir !== null);
    const firPercent = firHoles.length ? Math.round((firHoles.filter((h) => h.fir).length / firHoles.length) * 100) : 0;

    // GIR%
    const girHoles = holes.filter((h) => h.gir !== null);
    const girPercent = girHoles.length ? Math.round((girHoles.filter((h) => h.gir).length / girHoles.length) * 100) : 0;

    // Avg putts per round
    const puttsHoles = holes.filter((h) => h.putts !== null);
    const totalPutts = puttsHoles.reduce((s, h) => s + (h.putts ?? 0), 0);
    const avgPutts = rounds.length ? Math.round((totalPutts / rounds.length) * 10) / 10 : 0;

    // Scramble%
    const scrambleHoles = holes.filter((h) => h.scramble !== null && h.gir === false);
    const madeScrambles = scrambleHoles.filter((h) => h.scramble === "yes" || h.scramble === "sand_save");
    const scramblePercent = scrambleHoles.length ? Math.round((madeScrambles.length / scrambleHoles.length) * 100) : 0;

    return { stats: { firPercent, girPercent, avgPutts, scramblePercent }, roundCount: rounds.length };
  };

  const handleGenerate = async () => {
    if (!user) return;
    setIsLoading(true);
    setResponse("");

    try {
      const result = await computeStats();
      if (!result) {
        toast({ title: "We couldn't generate your practice plan right now — make sure you have at least 1 round logged and try again.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const resp = await fetch(PRACTICE_PLAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(result),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get practice plan");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResponse(accumulated);
            }
          } catch {
            // partial JSON, wait for more
          }
        }
      }
    } catch (err) {
      console.error("Practice plan error:", err);
      toast({ title: "We couldn't generate your practice plan right now — make sure you have at least 1 round logged and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown bold rendering
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="mt-6">
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Get My Practice Plan
          </>
        )}
      </Button>

      {response && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              TRACKD Caddy 🏌️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {renderMarkdown(response)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticePlan;
