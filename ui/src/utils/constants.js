export const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Pune',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad',
];

export const CATEGORIES = [
  'Leafy Greens',
  'Root Vegetables',
  'Gourds',
  'Herbs',
  'Fruits',
  'Organic Staples',
];

export const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery' },
  { id: 'UPI', label: 'UPI' },
  { id: 'CARD', label: 'Debit/Credit card' },
];

export const DELIVERY_SLOTS = [
  { id: 'MORNING', label: 'Morning', window: '6-10 AM' },
  { id: 'AFTERNOON', label: 'Afternoon', window: '12-4 PM' },
  { id: 'EVENING', label: 'Evening', window: '5-9 PM' },
];

export const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const PRODUCT_UNITS = ['kg', 'g', 'bunch', 'piece'];
