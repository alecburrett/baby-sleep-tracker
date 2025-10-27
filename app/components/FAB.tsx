'use client'

interface FABProps {
  isActive: boolean
  loading: boolean
  onClick: () => void
}

export default function FAB({ isActive, loading, onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-50 ${
        isActive
          ? 'bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
          : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
      }`}
      aria-label={isActive ? 'End sleep session' : 'Start sleep session'}
    >
      <span className="text-3xl text-white">
        {loading ? '⏳' : isActive ? '✓' : '+'}
      </span>
    </button>
  )
}
