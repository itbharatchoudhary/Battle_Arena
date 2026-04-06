import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PromptInput from './components/PromptInput';
import SolutionCard from './components/SolutionCard';
import JudgePanel from './components/JudgePanel';
import { useArena } from './hooks/useArena';

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -26 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12 text-center"
    >
      {/* Hero icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-white/10 flex items-center justify-center text-5xl shadow-2xl shadow-violet-500/20">
          ⚔️
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 border-2 border-slate-900 flex items-center justify-center text-xs">
          🔥
        </div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-xs">
          ⚡
        </div>
      </div>

      <div className="max-w-md">
        <h1 className="text-3xl font-bold gradient-text mb-3">AI Battle Arena</h1>
        <p className="text-slate-600 dark:text-white/40 text-sm leading-relaxed">
          Submit any problem or question and watch{' '}
          <span className="text-orange-500 dark:text-orange-400 font-medium">Mistral AI</span> and{' '}
          <span className="text-violet-500 dark:text-violet-400 font-medium">Cohere AI</span> compete for the best answer.{' '}
          <span className="text-blue-500 dark:text-blue-400 font-medium">Gemini</span> judges the winner.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { icon: '🤖', label: 'Two AI Models' },
          { icon: '⚖️', label: 'AI Judge' },
          { icon: '📊', label: 'Score Analysis' },
          { icon: '⚡', label: 'Real-time' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-slate-600 dark:text-white/50 border border-slate-200 dark:border-white/10"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ErrorBanner({ message, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm"
    >
      <span className="text-base">⚠️</span>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="ml-auto text-red-400/60 hover:text-red-300 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

function BattleView({ result, isLoading }) {
  const winner =
    result?.judge
      ? result.judge.solution_1_score > result.judge.solution_2_score
        ? 'mistral'
        : result.judge.solution_2_score > result.judge.solution_1_score
        ? 'cohere'
        : 'tie'
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1 pb-4"
    >
      {/* VS Header Bar */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 dark:from-orange-500/40 to-transparent" />
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-slate-200 dark:border-white/10 text-xs font-bold">
          <span className="text-orange-500 dark:text-orange-400">🔥 Mistral</span>
          <span className="text-slate-400 dark:text-white/30">VS</span>
          <span className="text-violet-500 dark:text-violet-400">Cohere ⚡</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-violet-500/20 dark:from-violet-500/40 to-transparent" />
      </div>

      {/* Split Cards */}
      <div className="flex-none grid grid-cols-2 gap-4 min-h-[400px]">
        <SolutionCard
          model="mistral"
          content={result?.solution_1}
          isLoading={isLoading}
          isWinner={winner === 'mistral'}
        />
        <SolutionCard
          model="cohere"
          content={result?.solution_2}
          isLoading={isLoading}
          isWinner={winner === 'cohere'}
        />
      </div>

      {/* Judge Panel */}
      <div className="shrink-0">
        <JudgePanel
          judge={result?.judge}
          isLoading={isLoading}
          problem={result?.problem}
        />
      </div>
    </motion.div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { status, result, error, history, submitProblem, reset, loadFromHistory, clearHistory } = useArena();

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light');
      document.body.classList.remove('light');
    } else {
      root.classList.add('light');
      document.body.classList.add('light');
    }
  }, [darkMode]);

  const isLoading = status === 'loading';
  const hasResult = status === 'success';
  const showBattle = isLoading || hasResult;

  return (
    <Layout
      history={history}
      onSelectHistory={loadFromHistory}
      onClearHistory={clearHistory}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((d) => !d)}
      onNewBattle={reset}
    >
      <div className="flex flex-col h-full px-6 py-5 gap-4 overflow-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white/90">
              {isLoading
                ? '⚔️ Battle in progress…'
                : hasResult
                ? '🏆 Battle Complete'
                : 'New Battle'}
            </h2>
            <p className="text-slate-500 dark:text-white/40 text-xs mt-0.5">
              {isLoading
                ? 'Mistral & Cohere are generating responses…'
                : hasResult
                ? 'Gemini has delivered the verdict.'
                : 'Ask any question to pit two AIs against each other.'}
            </p>
          </div>

          {/* Live indicator when loading */}
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-white/60">
              <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
              Live
            </div>
          )}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <ErrorBanner message={error} onDismiss={reset} />
          )}
        </AnimatePresence>

        {/* Prompt Input */}
        <div className="shrink-0">
          <PromptInput
            onSubmit={submitProblem}
            isLoading={isLoading}
            onReset={reset}
            hasResult={hasResult}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {showBattle ? (
              <BattleView
                key="battle"
                result={result}
                isLoading={isLoading}
              />
            ) : (
              <EmptyState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
