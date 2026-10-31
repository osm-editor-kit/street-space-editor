---
'@osm-editor-kit/street-imagery-react': patch
---

- **`PhotoDateRangeFilter`: click the chart**: a click or tap on the chart moves the nearer handle to that exact place, and a press there can go on as a drag. A vertical swipe on a phone still scrolls and leaves the filter alone. Arrow keys work as before.
- **`PhotoDateRangeFilter`: better handles**: mouse and touch now reach a handle through a target of at least 44px high and wide, while the handles look the same. Handles close together or on the same spot stay separate, and two handles at one end can no longer get stuck.
