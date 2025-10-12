import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link
        href="https://topcoderfullstack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-4xl font-bold tracking-tight transition-colors hover:text-primary sm:text-6xl lg:text-7xl"
      >
        TOPCODER FULLSTACK
      </Link>
    </div>
  )
}
