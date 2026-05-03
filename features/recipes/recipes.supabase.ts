import { supabase } from "@/lib/supabase";

export type RecipeAccess = "free" | "premium" | "program_metered";

export type RecipeItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  imageUrl: string;
  prepTimeMin: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  tags: string[];
  isFeatured: boolean;
  publishedAt: string | null;
  access: RecipeAccess;
  paywallEnabled: boolean;
};

type RecipeRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  image_url: string | null;
  prep_time_min: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  tags: string[] | null;
  is_featured: boolean;
  published_at: string | null;
};

type AccessRuleRow = {
  content_id: string;
  access_type: RecipeAccess;
  paywall_enabled: boolean;
};

function mapRecipe(
  row: RecipeRow,
  accessById: Map<string, AccessRuleRow>,
): RecipeItem {
  const accessRule = accessById.get(row.id);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category ?? "",
    imageUrl: row.image_url ?? "",
    prepTimeMin: row.prep_time_min,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    tags: row.tags ?? [],
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    access: accessRule?.access_type ?? "free",
    paywallEnabled: accessRule?.paywall_enabled ?? false,
  };
}

async function getPublishedRecipeRows() {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      slug,
      title,
      category,
      image_url,
      prep_time_min,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      tags,
      is_featured,
      published_at
    `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.log("❌ recipes query error:", error);
    return [];
  }

  console.log("✅ recipes rows:", data?.length ?? 0);
  return (data ?? []) as RecipeRow[];
}

async function getAccessRulesForRecipes(recipeIds: string[]) {
  if (!recipeIds.length) return new Map<string, AccessRuleRow>();

  const { data, error } = await supabase
    .from("content_access_rules")
    .select("content_id, access_type, paywall_enabled")
    .eq("content_type", "recipe")
    .in("content_id", recipeIds);

  if (error) {
    console.log("❌ recipe access rules query error:", error);
    return new Map<string, AccessRuleRow>();
  }

  const map = new Map<string, AccessRuleRow>();

  for (const row of data ?? []) {
    map.set(row.content_id, row as AccessRuleRow);
  }

  console.log("✅ recipe access rules:", map.size);
  return map;
}

export async function getAllRecipes() {
  const recipes = await getPublishedRecipeRows();
  const recipeIds = recipes.map((recipe) => recipe.id);

  const accessById = await getAccessRulesForRecipes(recipeIds);

  return recipes.map((row) => mapRecipe(row, accessById));
}

export async function getLatestRecipes(limit = 4) {
  const recipes = await getAllRecipes();
  return recipes.slice(0, limit);
}

export async function getFeaturedRecipes(limit = 4) {
  const recipes = await getAllRecipes();
  return recipes.filter((recipe) => recipe.isFeatured).slice(0, limit);
}

export async function getRecipeBySlug(slug: string) {
  const recipes = await getAllRecipes();
  return recipes.find((recipe) => recipe.slug === slug) ?? null;
}