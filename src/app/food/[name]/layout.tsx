import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const title = `Discover ${name} - Nutrispark`;
  const description = `Learn all about the nutritional values of ${name} on NutriTech. Explore now! `;

  return {
    title,
    description,
  };
}

export default function FoodLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
