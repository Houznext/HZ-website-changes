export enum CustomerNotificationType {
  QUOTATION_CONFIRMED = 'quotation_confirmed',
  QUOTATION_REVISED = 'quotation_revised',
  INVOICE_CREATED = 'invoice_created',
  INVOICE_PAYMENT_UPDATED = 'invoice_payment_updated',
  LIVEBUILD_DPR = 'livebuild_dpr',
  LIVEBUILD_BOQ = 'livebuild_boq',
  LIVEBUILD_DOCUMENT = 'livebuild_document',
  LIVEBUILD_PAYMENT = 'livebuild_payment',
  LIVEBUILD_QUERY = 'livebuild_query',
}

export enum CustomerNotificationResourceType {
  QUOTATION = 'quotation',
  INVOICE = 'invoice',
  LIVEBUILD_PROJECT = 'livebuild_project',
}
