/**
 * Click handler for a JOSM remote-control link (`http://127.0.0.1:8111/...`).
 *
 * JOSM answers the request itself, so the browser should not navigate away: the link is fetched
 * instead, and the default action is cancelled. JOSM sends CORS headers, so the fetch works from
 * any page. The promise rejects when JOSM is not running, as the request fails.
 */
export async function handleJosmLinkClick(e: Event): Promise<void> {
  const anchor = e.target instanceof Element ? e.target.closest('a') : null
  if (!anchor) return
  await fetch(anchor.href)
  e.preventDefault()
}
