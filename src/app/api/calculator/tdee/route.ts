const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
} as const;

type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

type Sex = "male" | "female";

interface TdeeRequestBody {
  age: number;
  sex: Sex;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
}

function isSex(value: unknown): value is Sex {
  return value === "male" || value === "female";
}

function isActivityLevel(value: unknown): value is ActivityLevel {
  return typeof value === "string" && value in ACTIVITY_FACTORS;
}

function validate(body: unknown): { data: TdeeRequestBody } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object." };
  }

  const { age, sex, weight, height, activityLevel } = body as Record<string, unknown>;

  if (typeof age !== "number" || !Number.isFinite(age) || age < 10 || age > 120) {
    return { error: "age must be a number between 10 and 120." };
  }

  if (!isSex(sex)) {
    return { error: "sex must be either 'male' or 'female'." };
  }

  if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 20 || weight > 300) {
    return { error: "weight must be a number between 20 and 300 (kg)." };
  }

  if (typeof height !== "number" || !Number.isFinite(height) || height < 50 || height > 250) {
    return { error: "height must be a number between 50 and 250 (cm)." };
  }

  if (!isActivityLevel(activityLevel)) {
    return {
      error:
        "activityLevel must be one of: sedentary, light, moderate, active, very-active.",
    };
  }

  return { data: { age, sex, weight, height, activityLevel } };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validate(body);

  if ("error" in validation) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { age, sex, weight, height, activityLevel } = validation.data;

  const bmr =
    sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * ACTIVITY_FACTORS[activityLevel];

  // Indicative macro split: 30% protein / 40% carbs / 30% fat
  const macros = {
    protein: Math.round((tdee * 0.3) / 4),
    carbohydrates: Math.round((tdee * 0.4) / 4),
    fat: Math.round((tdee * 0.3) / 9),
  };

  return Response.json({
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    macros,
  });
}
