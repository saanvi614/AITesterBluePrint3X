const NAV_TABS = ['board', 'dashboard', 'archive'];

export default function Header({
  activeView, onViewChange,
  searchQuery, onSearchChange,
  theme, onThemeToggle,
  onExport, onImport, onAddJob,
}) {
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => e.target.files[0] && onImport(e.target.files[0]);
    input.click();
  };

  return (
    <header className="flex items-center gap-3 px-5 py-2.5 border-b border-[#1e1e1e] bg-[#0d0d0d]">
      {/* Tab nav */}
      <nav className="flex items-center gap-1 mr-2">
        {NAV_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onViewChange(tab)}
            className={`px-3 py-1 rounded-md text-sm capitalize transition-colors
              ${activeView === tab
                ? 'text-white bg-[#1e1e1e]'
                : 'text-[#666] hover:text-[#aaa]'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#444] text-xs pointer-events-none">⌕</span>
        <input
          id="search-input"
          type="text"
          placeholder="Search... (/)"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-[#141414] border border-[#222] text-white placeholder-[#444] rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
        />
      </div>

      {/* Actions */}
      <button
        onClick={onExport}
        title="Export JSON"
        className="px-3 py-1.5 text-xs text-[#666] hover:text-white border border-[#222] hover:border-[#444] rounded-lg transition-colors"
      >
        CSV
      </button>
      <button
        onClick={handleImport}
        title="Import JSON"
        className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-white border border-[#222] hover:border-[#444] rounded-lg transition-colors text-sm"
      >
        ↑
      </button>
      <button
        onClick={onThemeToggle}
        title="Toggle theme"
        className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-white border border-[#222] hover:border-[#444] rounded-lg transition-colors text-sm"
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
      <button
        onClick={onAddJob}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-medium"
      >
        <span className="text-base leading-none">+</span> Add Job
      </button>
    </header>
  );
}
