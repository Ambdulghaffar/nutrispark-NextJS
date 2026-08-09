import { foods } from "@/data";
import { slugify } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const index = foods.findIndex((food) => slugify(food.name) === name);

  if (index !== -1) {
    return new Response(JSON.stringify(foods[index]), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response(JSON.stringify({ error: "Food not found" }), {
    headers: { "Content-Type": "application/json" },
    status: 404,
  });
}
