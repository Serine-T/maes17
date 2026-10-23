import { describe, expect, it } from 'vitest';
import { buildInquiryText, isValidContact, validateInquiry, whatsappUrl } from '@/components/contact/inquiry';

const valid = { name: 'Anna', contact: '+374 91 123456', service: 'land-surveying', message: 'Plot of 800 m² near the village.' };

describe('inquiry validation', () => {
  it('accepts a complete inquiry', () => {
    expect(validateInquiry(valid)).toEqual({});
  });

  it('reports each missing field', () => {
    expect(validateInquiry({ name: ' ', contact: '', service: '', message: '' })).toEqual({
      name: 'nameRequired',
      contact: 'contactRequired',
      service: 'serviceRequired',
      message: 'messageRequired',
    });
  });

  it('checks phone and email formats', () => {
    expect(isValidContact('name@example.com')).toBe(true);
    expect(isValidContact('091 12-34-56')).toBe(true);
    expect(isValidContact('12345')).toBe(false);
    expect(isValidContact('not a contact')).toBe(false);
    expect(validateInquiry({ ...valid, contact: 'abc' }).contact).toBe('contactInvalid');
  });

  it('requires a meaningful message', () => {
    expect(validateInquiry({ ...valid, message: 'hi' }).message).toBe('messageShort');
  });

  it('builds a prefilled WhatsApp link without sending anything', () => {
    const text = buildInquiryText(valid, 'Land surveying', {
      greeting: 'Hello',
      name: 'Name',
      contact: 'Contact',
      service: 'Service',
      message: 'Message',
    });
    expect(text).toContain('Name: Anna');
    const url = whatsappUrl(text);
    expect(url.startsWith('https://wa.me/37441171793?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toBe(text);
  });
});
