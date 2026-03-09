/**
 * Single guard for /api/itemsclick so only one request is made per session
 * across furniture, homedecor, and electronics ItemsSection components.
 */
let itemsclickFetched = false;

export function shouldFetchItemsclick(): boolean {
  if (itemsclickFetched) return false;
  itemsclickFetched = true;
  return true;
}
