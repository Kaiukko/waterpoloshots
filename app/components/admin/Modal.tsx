"use client";
export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="card-surface max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 pb-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-black italic">{title}</h3>
          <button onClick={onClose} className="text-outline">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
