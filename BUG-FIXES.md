# BUG FIXES & IMPROVEMENTS - 2026-03-27

## New Features
- **Interactive watermark area selection**: Users can drag to select exactly which areas contain watermarks, multiple areas supported
- Each selected area is permanently marked with a red border so user always knows what's selected
- Mask generation correctly matches Clipdrop API requirement: **black = keep, white = remove**
- Image auto-scales to fit screen without clipping, coordinate scaling maintains accuracy

## UI/UX Improvements
- Watermark Remover: only allow single image selection (since marking needed), hide add more button
- "Start Processing" button only appears after selecting images, not shown initially
- Direct redirect to login page when no session exists on dashboard, no error page shown
- Selected image and processed result both support click-to-zoom preview in modal popup
- Detect duplicate files when uploading and alert user, skip duplicates
- Limit maximum 5 images for batch processing, show + button when under limit

## Bug Fixes
- Fixed syntax error in JSX that caused compilation failure
- Fixed querying non-existent `processed_count` column in database that prevented user data loading
- Fixed inverted mask colors that caused whole image to be corrupted
- Fixed red borders not persisting after selection completes
- Fixed points deduction not working: removed unused RPC function, directly calculate and update on backend
- Fixed watermark image overflow: image now fits container completely, bottom-right watermarks are visible

## API Changes
- Changed watermark removal API from Cloudmersive to Clipdrop Cleanup API (better quality)
- Backend accepts user-provided mask from frontend and passes directly to Clipdrop API

## Project Renaming
- Renamed project from "Amazon AI Image / Amazon AI Image Tools" to **"Amazon Image Pro"**
- Removed all "AI" mentions from UI across all pages

---

# BUG FIXES & IMPROVEMENTS - 2026-03-28

## Watermark Selection Interactive Fixes
1. **Fixed multiple selection disappearing issue**: After you finish dragging a selection, the blue box would disappear because of React closure bug - `redrawAllSelections` was capturing old `markedRects`
   - Solution: Use refs to always get the latest selection list, guaranteeing correct redraw
   - Now all selected areas stay permanently visible until you click "Clear All Marks"

2. **Followed exact drawing specification from requirements**:
   - Border color: `#007AFF` (iOS/Apple native professional blue)
   - Border width: `2px`
   - Selection fill overlay: `rgba(0, 122, 255, 0.20)` semi-transparent blue
   - Added mousemove throttling (30fps max) to reduce rendering frequency and improve performance
   - Correct coordinate correction using `getBoundingClientRect()` to eliminate page offset
   - Only start drawing when mousedown is inside canvas bounds
   - Only save selection when width & height > 10px (filters accidental tiny selections)
   - Cancel drawing automatically when mouse leaves canvas

3. **Fixed stale selection issue when changing images**:
   - When user selects a new image to replace the old one, automatically clear all previous selected areas
   - Prevents old selection boxes from staying on the new image which confuses users

## Network/API Performance Improvements (for slow connections from China)
1. **Increased timeout from 60s to 180s (3 minutes)**: Gives slow international connections enough time to complete
2. **Added automatic retry**: If first attempt fails, wait 2 seconds and retry once automatically - greatly improves success rate on unstable networks
3. **Added detailed server logging**: Logs each attempt's response time so you can diagnose network issues
4. **Fixed error swallowing bug**: When all retries fail, correctly throw an Error object so frontend can display the actual error message instead of generic "Processing failed"
5. **Improved frontend error message**: Shows full error details to help diagnose problems faster

## Summary
- ✅ All selected areas stay visible (no more disappearing after mouse move)
- ✅ Selection style matches the iOS/Apple professional blue spec
- ✅ Changing images automatically clears old selections
- ✅ Better tolerance for slow/unstable international network connections
  - Auto-retry improves success rate
  - Longer timeout accommodates slow download
  - Better error messages when things go wrong
