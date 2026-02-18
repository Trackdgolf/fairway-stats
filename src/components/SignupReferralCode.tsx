import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Gift } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { normalizeReferralCode } from '@/lib/referralUtils';
import { savePendingReferral } from '@/hooks/usePendingReferral';

const SignupReferralCode = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [accepted, setAccepted] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const handleApply = async () => {
    setError('');
    const normalized = normalizeReferralCode(code);
    if (!normalized) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    try {
      const { data: influencer } = await supabase
        .from('influencers')
        .select('id')
        .eq('code', normalized)
        .eq('is_active', true)
        .maybeSingle();

      if (!influencer) {
        setError('Invalid referral code');
        setLoading(false);
        return;
      }

      savePendingReferral(normalized);
      setAccepted(normalized);
      setCode('');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="p-1 rounded-full bg-primary/10">
          <Check className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm text-foreground font-medium">
          Code accepted ✅
        </span>
        <span className="text-xs text-muted-foreground">
          Will be applied after sign up
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-primary hover:underline py-1"
      >
        Have a referral code?
      </button>
    );
  }

  return (
    <div className="space-y-2 py-2">
      <p className="text-xs text-muted-foreground">
        Supports the creator who shared TRACKD with you.
      </p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            placeholder="e.g. TRACKDJOE"
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
            disabled={loading}
          />
        </div>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || loading}
          size="sm"
          className="shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default SignupReferralCode;
