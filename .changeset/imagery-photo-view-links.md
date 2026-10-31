---
"@osm-editor-kit/street-imagery": patch
---

- **Links with the view inside the photo**: `providerExternalLink(photo, view)` opens Mapillary and Panoramax on the same photo with the same zoom and pan. The new type `PhotoView` holds that view; a view of another photo is ignored. Without a `view` the links stay as they were.
