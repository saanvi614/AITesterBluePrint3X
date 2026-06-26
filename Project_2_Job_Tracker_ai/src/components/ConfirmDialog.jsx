export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] dark:bg-[#1e1e1e] light:bg-white border border-[#2a2a2a] rounded-xl p-6 w-80 shadow-2xl">
        <p className="text-white dark:text-white text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#444] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
