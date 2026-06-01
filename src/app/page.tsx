import { loadAmnogData } from "@/lib/amnog";

export default function Home() {
  const data = loadAmnogData();

  return (
    <main className="min-h-screen bg-white p-16 font-sans">
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
        AMNOG Dashboard
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        Datenstand: {data.generated_at.slice(0, 10)} · Quelle: {data.source}
      </p>
      <div className="flex gap-8">
        <div className="rounded-xl border border-zinc-200 p-6 w-48">
          <div className="text-3xl font-bold text-zinc-900">
            {data.count_verfahren.toLocaleString("de-DE")}
          </div>
          <div className="text-sm text-zinc-500 mt-1">Verfahren</div>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6 w-48">
          <div className="text-3xl font-bold text-zinc-900">
            {data.count_patientengruppen.toLocaleString("de-DE")}
          </div>
          <div className="text-sm text-zinc-500 mt-1">Patientengruppen</div>
        </div>
      </div>
    </main>
  );
}
