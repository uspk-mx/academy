/**
 * Stripe publishable (client) key — safe to ship to the browser. From
 * `VITE_STRIPE_PUBLISHABLE_KEY`, with a dev fallback (a test key). Use the live
 * key via env in production. The SECRET key never lives in this app — it stays
 * on the courses API, which creates the PaymentIntent / Checkout Session.
 */
export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
  "pk_test_51R9C9I2MAp40KraGnAdMtUN8JE63lqgXNpTxZThYxc1rXJavX4wPvKQGSBU4BLLFG1uBF1UoDtAY1nHJkjg0iIGE00c0KguRAS"
