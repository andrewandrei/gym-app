// app/recipes/recipe.data.ts

export type Ingredient = {
  amount: string;
  name: string;
};

export type Step = {
  number: number;
  text: string;
};

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type RecipeCategory =
  | "Breakfast"
  | "Main course"
  | "Dinner"
  | "Post-workout"
  | "Snack";

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  "Breakfast",
  "Main course",
  "Dinner",
  "Post-workout",
  "Snack",
];

export type Recipe = {
  id: string;
  title: string;
  tagline: string;
  imageUrl: string;
  durationMin: number;
  servings: number;
  category: RecipeCategory;
  tags: string[];
  macrosPerServing: Macros;
  ingredients: Ingredient[];
  steps: Step[];
};

export const RECIPES: Record<string, Recipe> = {
  // ── Breakfast ──────────────────────────────────────────────

  "r-001": {
    id: "r-001",
    title: "Protein Cinnamon Pancakes",
    tagline:
      "Protein for the muscles, cinnamon for the soul — that's how the morning can begin.",
    imageUrl:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1600&q=80",
    durationMin: 25,
    servings: 2,
    category: "Breakfast",
    tags: ["High Protein", "Meal Prep"],
    macrosPerServing: { calories: 340, protein: 28, carbs: 38, fat: 8 },
    ingredients: [
      { amount: "40 ml", name: "(soy)milk" },
      { amount: "1", name: "banana(s)" },
      { amount: "3", name: "egg(s)" },
      { amount: "80 g", name: "oat flakes" },
      { amount: "15 g", name: "baking powder" },
      { amount: "0.5 tsp", name: "cinnamon" },
      { amount: "30 g", name: "protein powder (vanilla)" },
    ],
    steps: [
      { number: 1, text: "Blend oat flakes into a fine flour. Mash the banana in a bowl." },
      { number: 2, text: "Add eggs, milk, oat flour, protein powder, baking powder, and cinnamon. Mix until smooth." },
      { number: 3, text: "Heat a non-stick pan over medium heat. Pour small rounds of batter. Cook 2–3 minutes per side until golden." },
      { number: 4, text: "Serve stacked with fresh berries, a drizzle of honey, or almond flakes." },
    ],
  },

  "r-002": {
    id: "r-002",
    title: "Greek Yogurt + Berries",
    tagline:
      "Simple, fast, and loaded with protein — the breakfast that takes zero thinking.",
    imageUrl:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1600&q=80",
    durationMin: 10,
    servings: 1,
    category: "Breakfast",
    tags: ["High Protein", "Quick"],
    macrosPerServing: { calories: 280, protein: 24, carbs: 32, fat: 6 },
    ingredients: [
      { amount: "200 g", name: "Greek yogurt (0% or 2%)" },
      { amount: "80 g", name: "mixed berries" },
      { amount: "15 g", name: "honey or maple syrup" },
      { amount: "20 g", name: "granola" },
      { amount: "10 g", name: "chia seeds" },
    ],
    steps: [
      { number: 1, text: "Spoon Greek yogurt into a bowl." },
      { number: 2, text: "Top with mixed berries and granola." },
      { number: 3, text: "Drizzle with honey and sprinkle chia seeds. Serve immediately." },
    ],
  },

  "r-003": {
    id: "r-003",
    title: "Overnight Oats with Peanut Butter",
    tagline:
      "Prep the night before, grab in the morning. Slow carbs and protein to start strong.",
    imageUrl:
      "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1600&q=80",
    durationMin: 5,
    servings: 1,
    category: "Breakfast",
    tags: ["Meal Prep", "High Protein"],
    macrosPerServing: { calories: 410, protein: 22, carbs: 48, fat: 16 },
    ingredients: [
      { amount: "60 g", name: "rolled oats" },
      { amount: "150 ml", name: "milk (any)" },
      { amount: "20 g", name: "peanut butter" },
      { amount: "15 g", name: "honey" },
      { amount: "20 g", name: "protein powder (chocolate)" },
      { amount: "1 tbsp", name: "chia seeds" },
    ],
    steps: [
      { number: 1, text: "Combine oats, milk, protein powder, and chia seeds in a jar. Stir well." },
      { number: 2, text: "Seal and refrigerate overnight (at least 6 hours)." },
      { number: 3, text: "In the morning, top with peanut butter and a drizzle of honey." },
    ],
  },

  // ── Main course ────────────────────────────────────────────

  "r-004": {
    id: "r-004",
    title: "Low Carb Lemon Pepper Chicken with Tzatziki",
    tagline:
      "Clean protein, bold flavour — a go-to meal that fits every cut without tasting like one.",
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
    durationMin: 35,
    servings: 2,
    category: "Main course",
    tags: ["High Protein", "Low Carb"],
    macrosPerServing: { calories: 420, protein: 48, carbs: 12, fat: 18 },
    ingredients: [
      { amount: "400 g", name: "chicken breast" },
      { amount: "1 tbsp", name: "olive oil" },
      { amount: "1 tsp", name: "lemon pepper seasoning" },
      { amount: "½", name: "lemon, juiced" },
      { amount: "150 g", name: "cucumber, grated" },
      { amount: "120 g", name: "Greek yogurt (full fat)" },
      { amount: "1 clove", name: "garlic, minced" },
      { amount: "1 tbsp", name: "fresh dill, chopped" },
      { amount: "Salt & pepper", name: "to taste" },
      { amount: "200 g", name: "mixed greens" },
    ],
    steps: [
      { number: 1, text: "Season chicken breasts with lemon pepper, salt, and a squeeze of lemon juice. Let sit for 5 minutes." },
      { number: 2, text: "Heat olive oil in a pan over medium-high heat. Cook chicken 5–6 minutes per side until golden and cooked through. Rest for 3 minutes, then slice." },
      { number: 3, text: "For the tzatziki: squeeze excess water from grated cucumber. Mix with Greek yogurt, garlic, dill, a drizzle of olive oil, and salt." },
      { number: 4, text: "Plate the mixed greens, lay sliced chicken on top, and serve with a generous spoon of tzatziki." },
    ],
  },

  "r-005": {
    id: "r-005",
    title: "Turkey & Rice Bowl",
    tagline:
      "The classic bodybuilder staple, but actually seasoned. Clean bulk approved.",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1600&q=80",
    durationMin: 30,
    servings: 2,
    category: "Main course",
    tags: ["High Protein", "Meal Prep"],
    macrosPerServing: { calories: 480, protein: 42, carbs: 52, fat: 10 },
    ingredients: [
      { amount: "400 g", name: "lean ground turkey" },
      { amount: "200 g", name: "basmati rice (dry)" },
      { amount: "1 tbsp", name: "soy sauce" },
      { amount: "1 tsp", name: "garlic powder" },
      { amount: "1 tsp", name: "smoked paprika" },
      { amount: "100 g", name: "broccoli florets" },
      { amount: "1 tbsp", name: "olive oil" },
      { amount: "Salt & pepper", name: "to taste" },
    ],
    steps: [
      { number: 1, text: "Cook rice according to package instructions." },
      { number: 2, text: "Heat olive oil in a pan. Cook ground turkey, breaking it apart, until browned. Season with garlic powder, paprika, soy sauce, salt and pepper." },
      { number: 3, text: "Steam or sauté broccoli until tender-crisp." },
      { number: 4, text: "Serve rice in a bowl, top with seasoned turkey and broccoli." },
    ],
  },

  // ── Dinner ─────────────────────────────────────────────────

  "r-006": {
    id: "r-006",
    title: "Salmon + Greens",
    tagline:
      "Omega-3s, clean protein, and a plate that looks like it came from a restaurant. 18 minutes flat.",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1600&q=80",
    durationMin: 18,
    servings: 1,
    category: "Dinner",
    tags: ["Omega-3", "Low Carb"],
    macrosPerServing: { calories: 460, protein: 42, carbs: 8, fat: 28 },
    ingredients: [
      { amount: "180 g", name: "salmon fillet (skin-on)" },
      { amount: "1 tbsp", name: "olive oil" },
      { amount: "Salt & pepper", name: "to taste" },
      { amount: "½", name: "lemon" },
      { amount: "100 g", name: "baby spinach" },
      { amount: "50 g", name: "rocket (arugula)" },
      { amount: "½", name: "avocado, sliced" },
      { amount: "1 tbsp", name: "balsamic glaze" },
    ],
    steps: [
      { number: 1, text: "Pat salmon dry and season with salt and pepper. Heat olive oil in a pan over medium-high heat." },
      { number: 2, text: "Place salmon skin-side down. Cook 4 minutes until skin is crispy, flip, and cook 3 more minutes." },
      { number: 3, text: "Toss spinach and rocket on a plate. Add sliced avocado and a squeeze of lemon." },
      { number: 4, text: "Place salmon on top and finish with balsamic glaze." },
    ],
  },

  "r-007": {
    id: "r-007",
    title: "Chicken Stir-Fry with Vegetables",
    tagline:
      "Quick, high-protein, and loaded with colour. A weeknight dinner that actually tastes like effort.",
    imageUrl:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1600&q=80",
    durationMin: 20,
    servings: 2,
    category: "Dinner",
    tags: ["High Protein", "Quick"],
    macrosPerServing: { calories: 380, protein: 40, carbs: 22, fat: 14 },
    ingredients: [
      { amount: "350 g", name: "chicken breast, sliced" },
      { amount: "1 tbsp", name: "sesame oil" },
      { amount: "2 tbsp", name: "soy sauce" },
      { amount: "1 tbsp", name: "honey" },
      { amount: "1 tsp", name: "fresh ginger, grated" },
      { amount: "1 clove", name: "garlic, minced" },
      { amount: "1", name: "bell pepper, sliced" },
      { amount: "100 g", name: "broccoli florets" },
      { amount: "80 g", name: "snap peas" },
      { amount: "1 tsp", name: "sesame seeds" },
    ],
    steps: [
      { number: 1, text: "Heat sesame oil in a wok or large pan over high heat. Cook chicken slices 4–5 minutes until browned. Remove and set aside." },
      { number: 2, text: "In the same pan, stir-fry bell pepper, broccoli, and snap peas for 3–4 minutes until tender-crisp." },
      { number: 3, text: "Return chicken to the pan. Add soy sauce, honey, ginger, and garlic. Toss for 1–2 minutes until glossy." },
      { number: 4, text: "Serve in bowls, sprinkled with sesame seeds. Pair with rice if desired." },
    ],
  },

  // ── Post-workout ───────────────────────────────────────────

  "r-008": {
    id: "r-008",
    title: "Protein Shake — Chocolate Banana",
    tagline:
      "The 2-minute recovery window classic. Blend, drink, grow.",
    imageUrl:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1600&q=80",
    durationMin: 3,
    servings: 1,
    category: "Post-workout",
    tags: ["Quick", "High Protein"],
    macrosPerServing: { calories: 320, protein: 36, carbs: 34, fat: 6 },
    ingredients: [
      { amount: "30 g", name: "protein powder (chocolate)" },
      { amount: "1", name: "banana" },
      { amount: "250 ml", name: "milk (any)" },
      { amount: "1 tbsp", name: "peanut butter (optional)" },
      { amount: "3–4", name: "ice cubes" },
    ],
    steps: [
      { number: 1, text: "Add all ingredients to a blender." },
      { number: 2, text: "Blend on high for 30–45 seconds until smooth." },
      { number: 3, text: "Pour and drink within 30 minutes of finishing your workout." },
    ],
  },

  "r-009": {
    id: "r-009",
    title: "Egg White & Avocado Toast",
    tagline:
      "Fast fuel after training. Protein, healthy fats, and carbs in under 10 minutes.",
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1600&q=80",
    durationMin: 10,
    servings: 1,
    category: "Post-workout",
    tags: ["Quick", "High Protein"],
    macrosPerServing: { calories: 310, protein: 22, carbs: 28, fat: 12 },
    ingredients: [
      { amount: "4", name: "egg whites" },
      { amount: "2 slices", name: "whole grain bread" },
      { amount: "½", name: "avocado" },
      { amount: "Pinch", name: "chilli flakes" },
      { amount: "Salt & pepper", name: "to taste" },
      { amount: "1 tsp", name: "lemon juice" },
    ],
    steps: [
      { number: 1, text: "Toast the bread until golden." },
      { number: 2, text: "Scramble egg whites in a non-stick pan over medium heat until just set. Season with salt and pepper." },
      { number: 3, text: "Mash avocado with lemon juice and a pinch of salt. Spread on toast." },
      { number: 4, text: "Top with scrambled egg whites and finish with chilli flakes." },
    ],
  },

  // ── Snack ──────────────────────────────────────────────────

  "r-010": {
    id: "r-010",
    title: "Protein Energy Balls",
    tagline:
      "No-bake, no excuses. Batch these on Sunday and fuel the whole week.",
    imageUrl:
      "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1600&q=80",
    durationMin: 15,
    servings: 10,
    category: "Snack",
    tags: ["Meal Prep", "High Protein"],
    macrosPerServing: { calories: 120, protein: 8, carbs: 12, fat: 5 },
    ingredients: [
      { amount: "100 g", name: "rolled oats" },
      { amount: "60 g", name: "protein powder (vanilla)" },
      { amount: "80 g", name: "peanut butter" },
      { amount: "60 g", name: "honey" },
      { amount: "30 g", name: "dark chocolate chips" },
      { amount: "1 tbsp", name: "chia seeds" },
    ],
    steps: [
      { number: 1, text: "Mix all ingredients in a large bowl until a sticky dough forms." },
      { number: 2, text: "Roll into 10 even balls (roughly 30g each)." },
      { number: 3, text: "Refrigerate for at least 30 minutes to firm up. Store in the fridge for up to 5 days." },
    ],
  },

  "r-011": {
    id: "r-011",
    title: "Cottage Cheese & Rice Cakes",
    tagline:
      "The simplest high-protein snack. Crunchy, creamy, done in 2 minutes.",
    imageUrl:
      "https://images.unsplash.com/photo-1505576399279-0e0669bd30e0?auto=format&fit=crop&w=1600&q=80",
    durationMin: 3,
    servings: 1,
    category: "Snack",
    tags: ["Quick", "High Protein"],
    macrosPerServing: { calories: 180, protein: 18, carbs: 20, fat: 3 },
    ingredients: [
      { amount: "2", name: "rice cakes" },
      { amount: "100 g", name: "cottage cheese" },
      { amount: "Pinch", name: "everything bagel seasoning" },
      { amount: "½", name: "tomato, sliced (optional)" },
    ],
    steps: [
      { number: 1, text: "Spread cottage cheese evenly on rice cakes." },
      { number: 2, text: "Top with tomato slices if desired and sprinkle with everything bagel seasoning." },
    ],
  },
};

export function getRecipe(id?: string | null): Recipe | null {
  if (!id) return null;
  return RECIPES[id] ?? null;
}

export function getAllRecipes(): Recipe[] {
  return Object.values(RECIPES);
}

export function getRecipesByCategory(category: RecipeCategory): Recipe[] {
  return Object.values(RECIPES).filter((r) => r.category === category);
}