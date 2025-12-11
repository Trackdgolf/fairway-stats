import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface Club {
  id: string;
  name: string;
}

interface ClubSelectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  clubs: Club[];
  selectedClub: string;
  onSelect: (clubName: string) => void;
}

const ClubSelectorDrawer = ({
  open,
  onOpenChange,
  title,
  clubs,
  selectedClub,
  onSelect,
}: ClubSelectorDrawerProps) => {
  const handleSelect = (clubName: string) => {
    onSelect(clubName);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[40vh] bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-foreground text-center">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {clubs.map((club) => {
              const isSelected = selectedClub === club.name;
              return (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleSelect(club.name)}
                  className={cn(
                    "h-14 rounded-xl font-medium transition-all flex items-center justify-center",
                    isSelected
                      ? "bg-primary/20 text-yellow-500 border-2 border-primary dark:bg-[hsl(var(--round-accent))]/20 dark:text-yellow-400 dark:border-[hsl(var(--round-accent))]"
                      : "bg-muted text-foreground border border-border dark:bg-[hsl(var(--round-input))] dark:border-[hsl(var(--round-border))] hover:bg-muted/80 dark:hover:bg-[hsl(var(--round-input))]/80"
                  )}
                >
                  {club.name}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ClubSelectorDrawer;
