

## Add Courses Tab to Bottom Navigation

The Courses page exists and has a route, but it was never added to the bottom navigation bar. 

### Change

**File: `src/components/BottomNav.tsx`**

Add a new navigation item for Courses using the `MapPin` icon (consistent with the Courses page) to the `navItems` array:

```typescript
import { Home, BarChart3, Target, MapPin } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/stats", icon: BarChart3, label: "Stats" },
  { to: "/clubs", icon: Target, label: "Clubs" },
  { to: "/courses", icon: MapPin, label: "Courses" },
];
```

This is a one-line addition plus updating the import. The bottom nav will then show four tabs: Home, Stats, Clubs, and Courses.

