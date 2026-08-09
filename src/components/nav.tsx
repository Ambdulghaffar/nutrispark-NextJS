import Link from "next/link";

export function Nav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 text-white sm:px-6">
      <Link href="/" className="font-semibold">
        Nutri<span className="title_colored">spark</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/calculator" className="hover:underline">
          Calculator
        </Link>
        <Link href="/journal" className="hover:underline">
          Journal
        </Link>
        <Link href="/favorites" className="hover:underline">
          Favorites
        </Link>
      </nav>
    </header>
  );
}
