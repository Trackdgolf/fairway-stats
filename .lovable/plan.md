

## Round Summary and Social Sharing

### Overview
After completing a round, instead of immediately navigating home, a styled summary modal will appear showing the round's key stats. Users can then either close it or share a graphic to their social media (Instagram, Facebook, etc.).

### How It Works

1. **Round Summary Modal** -- A new `RoundSummaryModal` component displays after a round is saved successfully. It shows:
   - Course name and date
   - Total score and score vs par (e.g. "+5" or "-2")
   - Key stats from that round: FIR%, GIR%, Scramble%, Avg Putts
   - The Trackd logo/branding on the graphic

2. **Shareable Graphic** -- A styled card within the modal acts as the "image" to share. We'll use the `html2canvas` library to convert this card into an image (PNG). This gives us a clean, branded graphic.

3. **Share Flow** -- When the user taps "Share":
   - The graphic card is rendered to a canvas image using html2canvas
   - On mobile (where the Web Share API is available), the native share sheet opens letting them pick Instagram, Facebook, WhatsApp, etc.
   - On desktop (fallback), the image downloads directly so they can share it manually

4. **Close Flow** -- A "Close" or "Done" button dismisses the modal and navigates to the home page as it does today.

### Changes Required

**New dependency:**
- `html2canvas` -- lightweight library to convert a DOM element into an image

**New file: `src/components/RoundSummaryModal.tsx`**
- A dialog/modal component that receives the round data (course name, total score, hole stats)
- Contains a branded summary card (the shareable graphic area)
- Calculates per-round stats (FIR%, GIR%, Scramble%, Avg Putts, Score vs Par) from the hole data
- "Share" button that captures the card as an image and triggers native sharing
- "Close" button that navigates home

**Modified file: `src/pages/Round.tsx`**
- After a successful save in `handleFinishRound`, instead of immediately calling `navigate('/')`, show the summary modal
- Pass the round data (course name, hole stats, total score) to the modal
- Navigation to home happens when the modal is closed

### Technical Details

- The shareable card will be a ref'd div styled with a gradient background, Trackd branding, and clean stat layout
- `html2canvas` captures that div as a canvas, which is converted to a blob
- The Web Share API (`navigator.share()`) accepts files, so we pass the image blob as a shareable file
- Feature detection ensures graceful fallback: if `navigator.canShare` doesn't support files, we fall back to downloading the image
- Stats are calculated locally from the `holeStats` array already in memory -- no extra database queries needed

