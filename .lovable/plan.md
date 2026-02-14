

## Dynamic Course Name Font Sizing

**File: `src/pages/Courses.tsx`**

Add a helper function that returns an appropriate Tailwind font-size class based on the length of the course name. This ensures long names like "Heythrop Park Hotel Golf and Country Club" shrink to fit within the green header, while short names like "Wentworth" remain at the standard size.

### Implementation

Add a utility function above the component:

```tsx
const getCourseNameClass = (name: string) => {
  if (name.length > 35) return "text-lg";
  if (name.length > 25) return "text-xl";
  if (name.length > 18) return "text-2xl";
  return "text-3xl";
};
```

Then update the course detail header title (currently `text-3xl font-bold text-header-foreground`) to use this function:

```tsx
<h1 className={`${getCourseNameClass(selectedCourse.courseName)} font-bold text-header-foreground`}>
  {selectedCourse.courseName}
</h1>
```

This keeps the font at `text-3xl` (matching the "Courses" list title) for short names, and steps down through `text-2xl`, `text-xl`, and `text-lg` as the name gets longer -- preventing overflow while avoiding an unnaturally small font for shorter names.

