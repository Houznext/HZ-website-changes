/**
 * Page-specific quotes shown at the end of product lists (Myntra-style).
 * Key must match ItemsFilterBar path: "furnitures" | "homedecor" | "electronics"
 */
export const LIST_QUOTES: Record<string, string[]> = {
  furnitures: [
    "Your home should tell the story of who you are.",
    "Furniture is the silent ambassador of your style.",
    "Good furniture turns a house into a home.",
    "Design begins where comfort meets beauty.",
    "Every piece has a purpose.",
    "Comfort is always in fashion.",
    "Well-chosen furniture never goes out of style.",
    "Spaces speak louder when furniture listens.",
    "Where design sits down and relaxes.",
    "Live comfortably. Sit beautifully."
  ],

  homedecor: [
    "Life is too short for boring walls.",
    "Home is where your style lives.",
    "Decorate with what makes you feel happy.",
    "Details make the design.",
    "Your space should inspire you every day.",
    "Small decor, big impact.",
    "Let your walls do the talking.",
    "Design is in the details.",
    "Style is how your home says hello.",
    "Make every corner count."
  ],

  electronics: [
    "Technology is best when it brings people together.",
    "Smart living starts with smart devices.",
    "Innovation that fits your lifestyle.",
    "Power your life with smarter tech.",
    "Designed to simplify your day.",
    "Where performance meets reliability.",
    "Upgrade your everyday experience.",
    "Technology that works as hard as you do.",
    "Smarter choices for modern living.",
    "The future, plugged in."
  ],
};

export type ListQuotePath = keyof typeof LIST_QUOTES;
