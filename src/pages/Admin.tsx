import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/contexts/AuthContext';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, ArrowUpDown, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type SortField = 'total_claimed' | 'total_converted' | 'total_paid' | 'last_claimed_at' | 'handle' | 'total_payable_amount';
type SortDir = 'asc' | 'desc';

interface InfluencerStat {
  influencer_id: string;
  handle: string;
  code: string;
  is_active: boolean;
  commission_monthly_cpa: number;
  commission_annual_cpa: number;
  total_claimed: number;
  total_converted: number;
  total_paid: number;
  total_converted_monthly: number;
  total_converted_annual: number;
  total_payable_amount: number;
  last_claimed_at: string | null;
}

interface PendingPayout {
  id: string;
  handle: string;
  code: string;
  converted_period: string;
  payable_amount: number;
  converted_at: string;
}

interface PaidPayout {
  id: string;
  handle: string;
  code: string;
  converted_period: string;
  payable_amount: number;
  converted_at: string;
  paid_at: string;
}

const Admin = () => {
  const { loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useAdminRole();
  const navigate = useNavigate();

  const [stats, setStats] = useState<InfluencerStat[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [paidPayouts, setPaidPayouts] = useState<PaidPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('total_claimed');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [confirmPayout, setConfirmPayout] = useState<PendingPayout | null>(null);

  useEffect(() => {
    if (!authLoading && !roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, roleLoading, isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-stats');

    if (error) {
      console.error('Error fetching admin stats:', error);
      setLoading(false);
      return;
    }

    setStats((data?.stats as unknown as InfluencerStat[]) || []);
    setPendingPayouts((data?.pendingPayouts as PendingPayout[]) || []);
    setPaidPayouts((data?.paidPayouts as PaidPayout[]) || []);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const handleMarkPaid = async () => {
    if (!confirmPayout) return;
    setMarkingPaidId(confirmPayout.id);
    setConfirmPayout(null);

    const { data, error } = await supabase.functions.invoke('mark-referral-paid', {
      body: { referral_id: confirmPayout.id },
    });

    if (error) {
      console.error('Error marking as paid:', error);
      toast.error('Failed to mark as paid');
      setMarkingPaidId(null);
      return;
    }

    toast.success(`Marked referral ${confirmPayout.code} as paid`);
    setMarkingPaidId(null);
    // Refresh data
    fetchData();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Influencer Stats Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-card-foreground">Influencer Referral Stats</h2>
            <p className="text-sm text-muted-foreground">Overview of referral performance by influencer</p>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : stats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No influencer data found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><SortButton field="handle" label="Handle" /></TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right"><SortButton field="total_claimed" label="Claimed" /></TableHead>
                    <TableHead className="text-right"><SortButton field="total_converted" label="Converted" /></TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Annual</TableHead>
                    <TableHead className="text-right"><SortButton field="total_paid" label="Paid" /></TableHead>
                    <TableHead className="text-right"><SortButton field="total_payable_amount" label="Payable (£)" /></TableHead>
                    <TableHead><SortButton field="last_claimed_at" label="Last Claim" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStats.map((row) => (
                    <TableRow key={row.influencer_id}>
                      <TableCell className="font-medium">{row.handle}</TableCell>
                      <TableCell className="font-mono text-sm">{row.code}</TableCell>
                      <TableCell>
                        <Badge variant={row.is_active ? 'default' : 'secondary'}>
                          {row.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.total_claimed}</TableCell>
                      <TableCell className="text-right">{row.total_converted}</TableCell>
                      <TableCell className="text-right">{row.total_converted_monthly}</TableCell>
                      <TableCell className="text-right">{row.total_converted_annual}</TableCell>
                      <TableCell className="text-right">{row.total_paid}</TableCell>
                      <TableCell className="text-right font-semibold">
                        £{Number(row.total_payable_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.last_claimed_at ? new Date(row.last_claimed_at).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Payouts Section with Tabs */}
        <div className="rounded-lg border bg-card">
          <Tabs defaultValue="pending">
            <div className="p-4 border-b">
              <TabsList>
                <TabsTrigger value="pending">
                  Awaiting Payout
                  {pendingPayouts.length > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {pendingPayouts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="paid">Paid (Last 90 Days)</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pending" className="mt-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : pendingPayouts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No conversions awaiting payout.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount (£)</TableHead>
                      <TableHead>Converted At</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.handle}</TableCell>
                        <TableCell className="font-mono text-sm">{row.code}</TableCell>
                        <TableCell>
                          <Badge variant={row.converted_period === 'annual' ? 'default' : 'secondary'}>
                            {row.converted_period}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          £{Number(row.payable_amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.converted_at ? new Date(row.converted_at).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={markingPaidId === row.id}
                            onClick={() => setConfirmPayout(row)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {markingPaidId === row.id ? 'Marking…' : 'Mark Paid'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="paid" className="mt-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : paidPayouts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No paid referrals in the last 90 days.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount (£)</TableHead>
                      <TableHead>Converted At</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidPayouts.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.handle}</TableCell>
                        <TableCell className="font-mono text-sm">{row.code}</TableCell>
                        <TableCell>
                          <Badge variant={row.converted_period === 'annual' ? 'default' : 'secondary'}>
                            {row.converted_period}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          £{Number(row.payable_amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.converted_at ? new Date(row.converted_at).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmPayout} onOpenChange={(open) => !open && setConfirmPayout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark referral as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the referral for <span className="font-semibold">{confirmPayout?.handle}</span> (code: {confirmPayout?.code}) as paid.
              Amount: <span className="font-semibold">£{Number(confirmPayout?.payable_amount || 0).toFixed(2)}</span> ({confirmPayout?.converted_period}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkPaid}>Confirm Payment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
