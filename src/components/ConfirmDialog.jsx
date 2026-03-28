export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "primary",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmClassName =
    confirmTone === "danger" ? "ghost-button danger" : "primary-button";

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-panel modal-panel-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="confirm-dialog-title">{title}</h2>
            <p>{description}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClassName}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
