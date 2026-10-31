/** The part of a click event the handler needs: a native `Event` or a React synthetic event. */
export type JosmClickEvent = Pick<Event, 'target' | 'preventDefault'>

/**
 * Click handler for a JOSM remote-control link (`http://127.0.0.1:8111/...`).
 *
 * JOSM answers the request itself, so the browser should not navigate away: the link is fetched
 * instead, and the default action is cancelled. JOSM sends CORS headers, so the fetch works from
 * any page. The promise rejects when JOSM is not running, as the request fails.
 */
export async function handleJosmLinkClick(e: JosmClickEvent): Promise<void> {
  const anchor = e.target instanceof Element ? e.target.closest('a') : null
  if (!anchor) return
  // before the await: once the handler yields, the browser has already followed the link
  e.preventDefault()
  await fetch(anchor.href)
}
