export const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatMonthYear = (ym) => {
  const [y, m] = ym.split("-");
  return new Date(y, +m - 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

export const CATEGORIES = {
  income: [
    "Salary",
    "Freelance",
    "Investment",
    "Rental",
    "Bonus",
    "Other Income",
  ],
  expense: [
    "Rent",
    "Food",
    "Transport",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Education",
    "Shopping",
    "Other",
  ],
};

export const COLORS = [
  "#6c63ff",
  "#22d3a5",
  "#f5a623",
  "#ff5569",
  "#4f9cf9",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];
