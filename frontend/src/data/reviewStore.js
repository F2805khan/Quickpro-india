const REVIEWS_KEY = "funservice-customer-reviews";

const clean = (value) => String(value || "").trim();

const sortReviews = (reviews) =>
  [...reviews].sort((a, b) => {
    if (Number(b.rating) !== Number(a.rating)) return Number(b.rating) - Number(a.rating);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

const readLocalReviews = () => {
  try {
    const saved = localStorage.getItem(REVIEWS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalReviews = (reviews) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(sortReviews(reviews)));
};

export const getCustomerReviews = async () => {
  return sortReviews(readLocalReviews());
};

export const saveCustomerReview = async (values) => {
  const review = {
    reviewId: `review-${Date.now()}`,
    name: clean(values.name),
    city: clean(values.city),
    service: clean(values.service),
    text: clean(values.text),
    rating: Math.min(5, Math.max(1, Number(values.rating) || 1)),
    createdAt: new Date().toISOString()
  };

  const reviews = [review, ...readLocalReviews()];
  saveLocalReviews(reviews);

  return review;
};

export const getBestCustomerReviews = (reviews, limit = 3) => sortReviews(reviews).slice(0, limit);
