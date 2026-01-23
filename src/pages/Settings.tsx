import { ArrowLeft, Plus, Trash2, RotateCcw, Loader2, AlertTriangle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { useUserPreferences, StatPreferences, Club } from "@/hooks/useUserPreferences";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Settings = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();
  const { signOut } = useAuth();
  const { 
    clubs, 
    renameClub, 
    addClub, 
    removeClub, 
    resetClubsToDefault,
    statPreferences,
    updateStatPreference,
    loading 
  } = useUserPreferences();
  const [newClubName, setNewClubName] = useState("");
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [editName, setEditName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Marketing email preference state
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [marketingLoading, setMarketingLoading] = useState(true);
  const [marketingUpdating, setMarketingUpdating] = useState(false);

  // Fetch marketing preference on mount
  useEffect(() => {
    const fetchMarketingPreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setMarketingLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('marketing-preference', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.error('Error fetching marketing preference:', error);
        } else if (data) {
          setMarketingEnabled(data.enabled || false);
        }
      } catch (err) {
        console.error('Error fetching marketing preference:', err);
      } finally {
        setMarketingLoading(false);
      }
    };

    fetchMarketingPreference();
  }, [supabase]);

  const handleMarketingToggle = async (enabled: boolean) => {
    setMarketingUpdating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to update preferences');
        return;
      }

      const { data, error } = await supabase.functions.invoke('marketing-preference', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { enabled }
      });

      if (error) {
        console.error('Error updating marketing preference:', error);
        toast.error('Failed to update preference');
        return;
      }

      setMarketingEnabled(enabled);
      toast.success(enabled ? 'Subscribed to marketing emails' : 'Unsubscribed from marketing emails');
    } catch (err) {
      console.error('Error updating marketing preference:', err);
      toast.error('Failed to update preference');
    } finally {
      setMarketingUpdating(false);
    }
  };

  const statOptions: { key: keyof StatPreferences; label: string; description: string }[] = [
    { key: "fir", label: "FIR (Fairway in Regulation)", description: "Track fairway accuracy on tee shots" },
    { key: "gir", label: "GIR (Green in Regulation)", description: "Track greens hit in regulation" },
    { key: "scramble", label: "Scramble %", description: "Track scramble success when missing GIR" },
    { key: "putts", label: "Putts", description: "Track putts per hole" },
    { key: "teeClub", label: "Tee Club", description: "Track which club used off the tee" },
    { key: "approachClub", label: "Approach Club", description: "Track which club used for approach shots" },
  ];

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      // Get the current session for the auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete your account");
        setIsDeletingAccount(false);
        return;
      }

      // Call the edge function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error deleting account:', error);
        toast.error("Failed to delete account. Please try again.");
        setIsDeletingAccount(false);
        return;
      }

      // Clear local storage
      localStorage.clear();
      
      // Sign out and redirect to auth page
      await signOut();
      
      toast.success("Your account has been permanently deleted");
      navigate('/auth', { replace: true });
      
    } catch (error) {
      console.error('Unexpected error deleting account:', error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsDeletingAccount(false);
    }
  };


  const handleAddClub = () => {
    if (newClubName.trim()) {
      addClub(newClubName.trim());
      setNewClubName("");
    }
  };

  const openEditDialog = (club: Club) => {
    setEditingClub(club);
    setEditName(club.name);
  };

  const handleSaveEdit = async () => {
    if (!editingClub || !editName.trim()) return;
    
    const oldName = editingClub.name;
    const newName = editName.trim();
    
    // If name hasn't changed, just close
    if (oldName === newName) {
      setEditingClub(null);
      return;
    }
    
    // Show confirmation dialog
    setShowRenameConfirm(true);
  };

  const confirmRename = async () => {
    if (!editingClub || !editName.trim()) return;
    
    const oldName = editingClub.name;
    const newName = editName.trim();
    
    setIsRenaming(true);
    setShowRenameConfirm(false);
    
    try {
      // Update all historical records in hole_stats
      const updates = await Promise.all([
        supabase
          .from("hole_stats")
          .update({ tee_club: newName })
          .eq("tee_club", oldName),
        supabase
          .from("hole_stats")
          .update({ approach_club: newName })
          .eq("approach_club", oldName),
        supabase
          .from("hole_stats")
          .update({ scramble_club: newName })
          .eq("scramble_club", oldName),
      ]);
      
      // Check for errors
      const errors = updates.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(errors[0].error?.message || "Failed to update historical data");
      }
      
      // Update local storage
      renameClub(editingClub.id, newName);
      
      // Invalidate queries to refresh stats
      queryClient.invalidateQueries({ queryKey: ["dispersionStats"] });
      queryClient.invalidateQueries({ queryKey: ["roundStats"] });
      
      toast.success(`Renamed "${oldName}" to "${newName}" across all historical data`);
      setEditingClub(null);
    } catch (error) {
      console.error("Error updating club name:", error);
      toast.error("Failed to update historical data. Please try again.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClub = () => {
    if (editingClub) {
      removeClub(editingClub.id);
      setEditingClub(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
      <PageHeader />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-header-foreground hover:text-header-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-header-foreground">Settings</h1>
        </div>

        {/* Appearance Section */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle light/dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* Subscription Section */}
        <div className="mb-6">
          <SubscriptionStatus />
        </div>

        {/* Notifications Section */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Marketing emails</p>
                <p className="text-sm text-muted-foreground">Receive product updates and tips</p>
              </div>
            </div>
            <Switch
              checked={marketingEnabled}
              onCheckedChange={handleMarketingToggle}
              disabled={marketingLoading || marketingUpdating}
            />
          </div>
        </Card>

        {/* My Bag Section - Collapsible */}
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="my-bag" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">My Bag</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Customize the clubs in your bag
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-4">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetClubsToDefault}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      onClick={() => openEditDialog(club)}
                      className="p-3 rounded-lg border bg-background hover:bg-accent cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-foreground truncate">{club.name}</p>
                      <p className="text-xs text-muted-foreground">Tap to edit</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="New club name"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddClub()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddClub}
                    disabled={!newClubName.trim()}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Edit Club Dialog */}
        <Dialog open={editingClub !== null && !showRenameConfirm} onOpenChange={() => setEditingClub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Club</DialogTitle>
            </DialogHeader>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Club name"
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              disabled={isRenaming}
            />
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={handleDeleteClub}
                className="flex-1 sm:flex-none"
                disabled={isRenaming}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1 sm:flex-none" disabled={isRenaming}>
                {isRenaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Confirmation Dialog */}
        <Dialog open={showRenameConfirm} onOpenChange={setShowRenameConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Historical Data?</DialogTitle>
              <DialogDescription>
                Renaming "{editingClub?.name}" to "{editName}" will also update all your historical stats to use the new name. This ensures your stats remain consolidated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowRenameConfirm(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button onClick={confirmRename} className="flex-1 sm:flex-none">
                Confirm Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stat Tracking Section - Collapsible */}
        <Accordion type="single" collapsible>
          <AccordionItem value="stat-tracking" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">Stat Tracking</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Choose which stats to track during your rounds
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-4">
                {statOptions.map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Switch
                      checked={statPreferences[option.key]}
                      onCheckedChange={(checked) => updateStatPreference(option.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Account Section */}
        <Card className="p-4 mt-6 border-destructive/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccountDialog(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <AlertDialogTitle className="text-xl">Delete Account</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-left space-y-3">
                <p>
                  This action is <strong>permanent and cannot be undone</strong>. Deleting your account will immediately remove:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All your golf rounds and statistics</li>
                  <li>Your club bag configuration</li>
                  <li>Your preferences and settings</li>
                  <li>Your subscription data</li>
                  <li>Your profile and account</li>
                </ul>
                <p className="font-medium text-foreground">
                  Are you absolutely sure you want to delete your account?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel disabled={isDeletingAccount} className="mt-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
