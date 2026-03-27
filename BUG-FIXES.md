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
