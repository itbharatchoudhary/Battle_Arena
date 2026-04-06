import Sidebar from './Sidebar';

export default function Layout({ children, history, onSelectHistory, onClearHistory, darkMode, onToggleDark, onNewBattle }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        history={history}
        onSelectHistory={onSelectHistory}
        onClearHistory={onClearHistory}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        onNewBattle={onNewBattle}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
