import { apiUrl } from './api';

export interface BookingStatusResult {
  bookingReference: string;
  customerName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: string;
}

export async function checkBookingStatus(
  bookingReference: string,
  contact: string
): Promise<BookingStatusResult> {
  const response = await fetch(apiUrl('/api/reservations/check'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ bookingReference, contact }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Unable to find that reservation.');
  }

  return result as BookingStatusResult;
}
