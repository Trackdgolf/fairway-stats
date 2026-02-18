import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Check } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { normalizeReferralCode } from "@/lib/referralUtils";
import { useAuth } from "@/contexts/AuthContext";

const ReferralCodeSection = () => {
  const supabase = getSupabaseClient();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if user already has a referral
  useEffect(() => {
    const fetchExisting = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("referrals")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setAppliedCode(data.code);
      }
      setLoading(false);
    };
    fetchExisting();
  }, [user, supabase]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please log in to apply a referral code");
      return;
    }

    const normalized = normalizeReferralCode(code);
    if (!normalized) {
      toast.error("Please enter a referral code");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Validate influencer
      const { data: influencer, error: lookupError } = await supabase
        .from("influencers")
        .select("id")
        .eq("code", normalized)
        .eq("is_active", true)
        .maybeSingle();

      if (lookupError) {
        toast.error("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (!influencer) {
        toast.error("Invalid referral code");
        setSubmitting(false);
        return;
      }

      // 2. Insert referral
      const { error: insertError } = await supabase.from("referrals").insert({
        user_id: user.id,
        influencer_id: influencer.id,
        code: normalized,
        status: "claimed",
      });

      if (insertError) {
        // unique constraint on user_id
        if (insertError.code === "23505") {
          // Fetch existing
          const { data: existing } = await supabase
            .from("referrals")
            .select("code")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) setAppliedCode(existing.code);
          toast.info("Referral already applied");
        } else {
          console.error("Referral insert error:", insertError);
          toast.error("Failed to apply referral code");
        }
        setSubmitting(false);
        return;
      }

      setAppliedCode(normalized);
      setCode("");
      toast.success("Referral applied! Thanks 🙌");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Referral Code</h2>
      {appliedCode ? (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Referral applied: {appliedCode}</p>
            <p className="text-sm text-muted-foreground">Thanks for supporting a creator!</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            Got a referral code? Enter it below.
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="pl-9"
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                disabled={submitting}
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={!code.trim() || submitting}
              className="shrink-0"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ReferralCodeSection;
