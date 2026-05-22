import Link from "next/link";

export default function PagerScheduleFooter() {
  return (
    <footer className="border-subtle bg-default border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Left column */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="font-cal text-emphasis text-lg font-semibold">Pager Schedule</span>
            </div>
            <p className="text-default mt-3 text-sm">Your meetings belong to you.</p>
            <p className="text-subtle mt-2 text-xs">◎ Zero tracking · EU hosted · Open source</p>
          </div>

          {/* Centre links */}
          <div>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Features", href: "/#features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Privacy", href: "/privacy-first" },
                { label: "For Lawyers", href: "/for-lawyers" },
                { label: "For Therapists", href: "/for-therapists" },
                { label: "For Journalists", href: "/for-journalists" },
                { label: "API docs", href: "/docs" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-default hover:text-emphasis text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right column — Warrant Canary */}
          <div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              Warrant Canary ✓
            </p>
            <p className="text-default mt-2 text-sm">No government requests received.</p>
            <p className="text-subtle mt-1 text-xs">Updated: May 2026</p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-subtle mt-10 border-t pt-6 text-center">
          <p className="text-subtle text-xs">
            © 2026 Pager Schedule · Built on{" "}
            <Link
              href="https://github.com/calcom/cal.com"
              target="_blank"
              className="hover:underline">
              Cal.com (Apache 2.0)
            </Link>{" "}
            · Swiss Privacy Law ·{" "}
            <Link href="https://pagerschedule.com" target="_blank" className="hover:underline">
              pagerschedule.com
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
