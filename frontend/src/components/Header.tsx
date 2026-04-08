export function Header() {
  return (
    <header className="border-b border-slate-700 bg-slate-900 py-6 px-8">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🔱</div>
        <div>
          <h1 className="text-2xl font-bold text-white">Poseidon</h1>
          <p className="text-sm text-slate-400">Opposition Research Extraction Tool</p>
        </div>
      </div>
    </header>
  );
}
