import Link from "next/link";

export function Nav() {
  return (
    <header className="flex items-center justify-between px-6 py-4 text-white">
      <Link href="/" className="font-semibold">
        Nutri<span className="title_colored">spark</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/calculator" className="hover:underline">
          Calculator
        </Link>
        <Link href="/favorites" className="hover:underline">
          Favorites
        </Link>
      </nav>
    </header>
  );
}
