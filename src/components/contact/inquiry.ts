import { companyConfig } from '@/config/company';

export interface InquiryValues {
  name: string;
  contact: string;
  service: string;
  message: string;
}

export type InquiryErrorKey =
  | 'nameRequired'
  | 'contactRequired'
  | 'contactInvalid'
  | 'serviceRequired'
  | 'messageRequired'
  | 'messageShort';

export type InquiryErrors = Partial<Record<keyof InquiryValues, InquiryErrorKey>>;

export const emptyInquiry: InquiryValues = { name: '', contact: '', service: '', message: '' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Accepts international or local numbers with spaces, dashes, dots and brackets; 8–15 digits. */
const PHONE = /^\+?[\d\s().-]+$/;

export function isValidContact(value: string): boolean {
  const v = value.trim();
  if (EMAIL.test(v)) return true;
  if (!PHONE.test(v)) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!values.name.trim()) errors.name = 'nameRequired';
  if (!values.contact.trim()) errors.contact = 'contactRequired';
  else if (!isValidContact(values.contact)) errors.contact = 'contactInvalid';
  if (!values.service) errors.service = 'serviceRequired';
  const message = values.message.trim();
  if (!message) errors.message = 'messageRequired';
  else if (message.length < 10) errors.message = 'messageShort';
  return errors;
}

export interface MessageLabels {
  greeting: string;
  name: string;
  contact: string;
  service: string;
  message: string;
}

export function buildInquiryText(values: InquiryValues, serviceLabel: string, labels: MessageLabels): string {
  return [
    labels.greeting,
    '',
    `${labels.name}: ${values.name.trim()}`,
    `${labels.contact}: ${values.contact.trim()}`,
    `${labels.service}: ${serviceLabel}`,
    '',
    `${labels.message}:`,
    values.message.trim(),
  ].join('\n');
}

/** WhatsApp click-to-chat link with the message prefilled. The visitor still has to press send. */
export function whatsappUrl(text?: string): string {
  const base = companyConfig.social.whatsapp;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const telUrl = `tel:${companyConfig.contact.phone}`;
