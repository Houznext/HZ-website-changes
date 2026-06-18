import type { CustomerUser } from '@/context/CustomerAuthContext'

/** Cart API uses linked store `user` id; portal login uses `int_customers` id. */
export function getStoreCartUserId(customer: CustomerUser | null | undefined): string | undefined {
  return customer?.storeUserId
}
