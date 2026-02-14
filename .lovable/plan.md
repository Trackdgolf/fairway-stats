
## Add Subtitle to Courses Page Header

The Stats and Club Performance pages both have a consistent header pattern with a title and subtitle. The Courses page currently uses a different structure and is missing the subtitle.

### Change

**File: `src/pages/Courses.tsx` (lines 41-50)**

Restructure the header section to match the pattern used on Stats and Club Performance pages:

- When on the **course list view**: Show "Courses" as the title with subtitle "Your personal hole difficulty rankings" using the same styling (`text-3xl font-bold text-header-foreground mb-2` for the title, `text-header-foreground/80` for the subtitle, wrapped in a `mb-6 relative` div).
- When on the **course detail view**: Keep the back button and course name title, but update the text styling to use `text-header-foreground` instead of `text-primary-foreground` for consistency.

```tsx
// Before
<div className="flex items-center gap-3 mb-6">
  {selectedCourse && (
    <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)} className="text-primary-foreground">
      <ChevronLeft className="w-5 h-5" />
    </Button>
  )}
  <h1 className="text-2xl font-bold text-primary-foreground">
    {selectedCourse ? selectedCourse.courseName : "Courses"}
  </h1>
</div>

// After
<div className="mb-6 relative">
  {selectedCourse ? (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)} className="text-header-foreground">
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <h1 className="text-3xl font-bold text-header-foreground">{selectedCourse.courseName}</h1>
    </div>
  ) : (
    <>
      <h1 className="text-3xl font-bold text-header-foreground mb-2">Courses</h1>
      <p className="text-header-foreground/80">Your personal hole difficulty rankings</p>
    </>
  )}
</div>
```

This matches the exact font size (`text-3xl`), weight (`font-bold`), color (`text-header-foreground`), spacing (`mb-2`), and subtitle style (`text-header-foreground/80`) used on the Stats and Club Performance pages.
