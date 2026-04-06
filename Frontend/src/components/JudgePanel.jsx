import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreBar from './ScoreBar';
import { JudgeSkeleton } from './Skeleton';

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ReasoningAccordion({ label, icon, reasoning, color }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors`}
        style={{ background: open ? 'rgba(255,255,255,0.04)' : 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-white/80">{label} Reasoning</span>
        </div>
        <ChevronIcon open={open} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 text-sm text-white/60 leading-relaxed border-t border-white/10">
              {reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JudgePanel({ judge, isLoading, problem }) {
  if (!judge && !isLoading) return null;

  const winner =
    judge
      ? judge.solution_1_score > judge.solution_2_score
        ? 'mistral'
        : judge.solution_2_score > judge.solution_1_score
        ? 'cohere'
        : 'tie'
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border border-yellow-500/30 flex items-center justify-center text-lg">
          ⚖️
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Gemini Judge</h3>
          <p className="text-white/40 text-xs">AI-powered verdict</p>
        </div>
        {winner && winner !== 'tie' && (
          <div className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
            {winner === 'mistral' ? '🔥 Mistral Wins' : '⚡ Cohere Wins'}
          </div>
        )}
        {winner === 'tie' && (
          <div className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-400/15 text-blue-300 border border-blue-400/30">
            🤝 It's a Tie!
          </div>
        )}
      </div>

      {/* Problem badge */}
      {problem && (
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 truncate">
          <span className="text-white/30 mr-1">Problem:</span>
          {problem}
        </div>
      )}

      {isLoading ? (
        <JudgeSkeleton />
      ) : (
        <>
          {/* Score Bars */}
          <div className="flex flex-col gap-3">
            <ScoreBar
              label="🔥 Mistral"
              score={judge.solution_1_score}
              color="linear-gradient(90deg, #f97316, #fb923c)"
              isWinner={winner === 'mistral'}
              delay={0}
            />
            <ScoreBar
              label="⚡ Cohere"
              score={judge.solution_2_score}
              color="linear-gradient(90deg, #8b5cf6, #a78bfa)"
              isWinner={winner === 'cohere'}
              delay={200}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Reasoning Accordions */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-white/40 font-medium uppercase tracking-widest mb-1">Judge Reasoning</p>
            <ReasoningAccordion
              label="Mistral"
              icon="🔥"
              reasoning={judge.solution_1_reasoning}
              color="orange"
            />
            <ReasoningAccordion
              label="Cohere"
              icon="⚡"
              reasoning={judge.solution_2_reasoning}
              color="violet"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
