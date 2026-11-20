/**
 * Formats a Kenyan phone number into international WhatsApp standard (e.g. 2547XXXXXXXX or 2541XXXXXXXX)
 */
export function formatKenyanWhatsAppNumber(input: string): string {
  if (!input) return '';
  // Strip all non-numeric characters except +
  let cleaned = input.trim().replace(/[^0-9]/g, '');

  // If starts with 0 (e.g. 0712345678 or 0112345678)
  if (cleaned.startsWith('0') && (cleaned.length === 10)) {
    return '254' + cleaned.substring(1);
  }

  // If already starts with 254
  if (cleaned.startsWith('254') && (cleaned.length === 12)) {
    return cleaned;
  }

  // If starts with 7 or 1 (9 digits)
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return '254' + cleaned;
  }

  return cleaned;
}

/**
 * Builds the WhatsApp direct chat link with pre-filled context
 */
export function generateWhatsAppLink(
  phone: string,
  sellerName: string,
  itemTitle: string,
  price: number,
  location?: string
): string {
  const sanitizedNumber = formatKenyanWhatsAppNumber(phone);
  const formattedPrice = `KES ${price.toLocaleString()}`;
  
  const locationText = location ? ` located around ${location}` : '';
  const message = `Hello ${sellerName || 'Seller'}! 👋\n\nI saw your listing on *DeKUT Soko*:\n📦 *${itemTitle}*\n💰 Price: *${formattedPrice}*${locationText}\n\nIs this item still available? I would like to arrange to view/buy it. Thanks!`;

  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate share link to spread a listing on student WhatsApp groups / Status
 */
export function generateWhatsAppShareLink(itemTitle: string, price: number, location: string): string {
  const url = window.location.href;
  const message = `🔥 Check out this deal on DeKUT Soko:\n*${itemTitle}* for *KES ${price.toLocaleString()}* at *${location}*!\n\nView here: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

