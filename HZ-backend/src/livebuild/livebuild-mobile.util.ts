/** @deprecated Import from `src/common/phone.util` */
import { mobileSuffix10 } from '../common/phone.util';

export {
  mobileSuffix10,
  normalizeLbMobile,
  normalizePortalMobile,
  sqlMobileSuffixMatch,
} from '../common/phone.util';

export function mobilesMatch(a: string, b: string): boolean {
  return mobileSuffix10(a) === mobileSuffix10(b);
}
