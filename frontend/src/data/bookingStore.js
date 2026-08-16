import { api } from "../api/client.js";

const bookingKey = (uid) => `funservice-bookings-${uid}`;

export const getCachedUserBookings = (uid) => {
  try {
    const saved = localStorage.getItem(bookingKey(uid));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalBookings = (uid, bookings) => {
  localStorage.setItem(bookingKey(uid), JSON.stringify(bookings));
};

const sortBookings = (bookings) =>
  [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getUserBookings = async (user) => {
  if (!user?.uid) return [];

  const hasToken = await api.hasToken();

  if (hasToken) {
    try {
      const bookings = sortBookings(await api.getMyBookings());
      saveLocalBookings(user.uid, bookings);
      return bookings;
    } catch (error) {
      console.warn("SQL booking history unavailable; using cached bookings.", error);
    }
  }

  return sortBookings(getCachedUserBookings(user.uid));
};

export const saveUserBooking = async (user, values) => {
  if (!user?.uid) throw new Error("Sign in before confirming your booking.");

  const hasToken = await api.hasToken();
  if (!hasToken) throw new Error("Your session expired. Sign in before confirming your booking.");

  const response = await api.createBooking(values);
  const booking = response.booking;
  const bookings = [booking, ...getCachedUserBookings(user.uid).filter(({ bookingId }) => bookingId !== booking.bookingId)];
  saveLocalBookings(user.uid, bookings);

  return booking;
};
