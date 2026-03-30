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

---

# BUG FIXES & IMPROVEMENTS - 2026-03-29

## Vercel Deployment Fixes (Watermark processing always failed)
1. **Root cause**: `isBuildTime` detection logic was wrong - `process.env.VERCEL` is always `true` on Vercel (both build time **and** runtime), so API always returned simulated response even at runtime
   - Fixed: Only detect as build time when `IS_BUILD_TIME=true` or `NETLIFY=true`
   - Now Vercel runtime correctly executes real processing logic

2. **Fixed "Lock broken by another request with the 'steal' option" Supabase error**:
   - Added `isLoadingUserData` lock to prevent concurrent requests to `getSession()`
   - Multiple `loadUserData` calls no longer conflict with each other

3. **Vercel Hobby timeout optimization**:
   - Vercel Hobby plan has 10s maximum timeout, Pro has 60s
   - Automatically adjust timeout based on environment: Hobby 8-20s, Pro longer
   - Increased retry from 2 to 3 attempts for better success rate
   - Added much more detailed server logging for debugging

## Product Changes
1. **Menu rename**: `Background Remover` → **`White Background`**
   - More accurate description of the actual feature: generate Amazon-ready main images with pure white background

2. **White Background feature completed**:
   - Step 1: Remove.bg removes background → transparent PNG
   - Step 2: Use sharp to create pure white canvas (RGB 255,255,255)
   - Step 3: Composite transparent product onto white background → output Amazon-ready image
   - Fallback: If sharp fails, still returns transparent image (no error)

3. **Image Upscale feature completed**:
   - Frontend added 1x/2x/4x selection buttons (user can choose scale factor)
   - **1x mode**: AI denoise + sharpen **without changing original dimensions**
     - Works by: 2x upscale via Clipdrop API → sharp resize back to original width
     - Result: Original size but AI enhanced with better clarity and less noise
   - **2x mode**: 2x super-resolution upscaling via Clipdrop API
   - **4x mode**: 4x super-resolution upscaling via Clipdrop API
   - Added tip: "1x = AI denoise & sharpen only (no size change), 2x is faster and sufficient for most Amazon images. 4x gives larger output but takes longer time."

4. **Fixed Clipdrop upscale URL 404 error**:
   - Final correct URL matching cleanup pattern: `https://clipdrop-api.co/upscale/v1`

## Summary
- ✅ Vercel watermark processing now works (was always returning simulated response before)
- ✅ Fixed Supabase concurrent request lock error
- ✅ Renamed menu to more accurate "White Background"
- ✅ Completed White Background feature (adds pure white background after removing background)
- ✅ Completed Image Upscale feature with 1x/2x/4x options
- ✅ Fixed 404 error for upscale API endpoint

---

# BUG FIXES & IMPROVEMENTS - 2026-03-30

## Clipdrop Upscale API 404 "Unknown url" Fixed
1. **Root cause**: Clipdrop changed their API endpoint structure - old `/upscale/v1` no longer exists
2. **Solution**: Updated to new endpoint `https://apis.clipdrop.co/super-resolution/v1`
   - Parameter changed from `scale` → `upscale` (string "2"/"4")
   - Successfully connects and returns processed image

## sharp Native Module Loading Fixed
1. **Root cause**: pnpm default security policy blocks build scripts for optional dependencies, so `libvips-cpp.so` never compiled
2. **Solution**:
   - Added `pnpm.allowedBuiltDependencies: ["sharp"]` to package.json
   - Added `allow-builds=sharp` to `.npmrc`
   - Downgraded from `sharp@0.33.2` → `sharp@0.32.6` for better Vercel compatibility
   - Now sharp loads successfully and can read image metadata

## Amazon Compliance Check Feature Completed (MVP)
Implemented complete 7-item Amazon main image compliance check:

| # | Check | Description |
|---|-------|-------------|
| 1 | **File Size** | Maximum 10MB |
| 2 | **Format** | JPG / PNG only |
| 3 | **Resolution** | Shortest side ≥ 1000px |
| 4 | **Aspect Ratio** | 1:1 square ±5% tolerance (0.95 ~ 1.05) |
| 5 | **Pure White Background** | Sample edge pixels (10px border), require ≥ 90% pixels near #FFFFFF (RGB ≥ 250) |
| 6 | **Text/Watermark Detection** | Use Cloudmersive OCR to detect any text → text = potential watermark, flag as violation |
| 7 | **Inappropriate Content** | Use Cloudmersive Safe Search to check adult/violence/medical/nudity |

**Product/UX Design**:
- **Billing**: 1 point per check (controls API costs - Cloudmersive OCR is billed per call)
- **Display**: Results displayed directly in results area, yellow background highlighting, no popup
- **No image processing**: We don't modify the image, just check it - so no processed image to display/download
- If compliant: Shows "✅ All checks passed! No issues found."
- If not compliant: Lists each issue with ⚠️ icon so user can fix and re-upload

## UX Improvements for Compliance Check
- Changed from popup alert to inline display in results area
- No image display/download since we didn't modify the image
- Compliance check results use yellow background to distinguish from normal processed images
- Each issue on its own line for easy reading

## Summary
- ✅ Fixed Clipdrop upscale endpoint 404 "Unknown url" error
- ✅ Fixed sharp native module loading error (libvips missing)
- ✅ Completed full Amazon compliance check MVP with 7 checks
- ✅ Each compliance check costs 1 point to control API cost
- ✅ Nice UX with inline result display in results area
