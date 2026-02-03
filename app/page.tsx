import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-zinc-50 dark:bg-black font-sans">
      <h1 className="text-4xl font-bold mb-12 text-black dark:text-white">Developer Toolkit</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <Link
          href="/json-formatter"
          className="group rounded-lg border border-black/10 dark:border-white/10 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30 bg-white dark:bg-neutral-900"
        >
          <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
            JSON Beautifier{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-60 text-black dark:text-white">
            Format, minify, and validate your JSON data.
          </p>
        </Link>

        <Link
          href="/music-player"
          className="group rounded-lg border border-black/10 dark:border-white/10 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/30 bg-white dark:bg-neutral-900"
        >
          <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
            Music Player{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-60 text-black dark:text-white">
            Experience music with a beautiful vinyl player and lyrics.
          </p>
        </Link>

        {/* Placeholder for future tools */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 px-5 py-4 flex items-center justify-center border-dashed border-2 border-gray-300 dark:border-neutral-800">
          <span className="text-sm text-gray-400">More tools coming soon...</span>
        </div>
      </div>
    </div>
  );
}
