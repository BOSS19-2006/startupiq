import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger = true, loading = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title"
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-ink-900">{title}</h2>
            {description && <p className="mt-2 text-sm text-ink-500">{description}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
              <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
