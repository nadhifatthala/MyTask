import { useEffect, useState } from 'react';
import { STATUSES } from '../supabaseClient';

export function DetailModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="detail-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="detail-dialog" role="dialog" aria-modal="true">
        <div className="detail-modal-head">
          <div>
            <span className="detail-modal-kicker">✦ DETAIL TASK</span>
            <h2>{item.task || 'Detail Task'}</h2>
          </div>
          <button className="detail-close" type="button" onClick={onClose} aria-label="Tutup pop-up">
            ×
          </button>
        </div>
        <div className="detail-divider" />
        <div className="detail-modal-body">{item.detail || 'Tidak ada detail.'}</div>
      </section>
    </div>
  );
}

export function ConfirmDeleteModal({ target, onCancel, onConfirm }) {
  useEffect(() => {
    if (!target) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, onCancel]);

  if (!target) return null;
  const isDraft = target.kind === 'draft';

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true">
        <div className="confirm-top">
          <div className="confirm-icon">!</div>
          <div className="confirm-copy">
            <h2>{isDraft ? 'Hapus draft ini?' : 'Hapus task ini?'}</h2>
            <p>{isDraft ? 'Draft akan dihapus permanen dari daftar.' : 'Task akan dihapus permanen dari daftar.'}</p>
          </div>
          <button className="confirm-x" type="button" onClick={onCancel} aria-label="Tutup">×</button>
        </div>
        <div className="confirm-actions">
          <button className="confirm-cancel" type="button" onClick={onCancel}>Batal</button>
          <button className="confirm-yes" type="button" onClick={onConfirm}>Hapus</button>
        </div>
      </section>
    </div>
  );
}

export function EditTaskModal({ item, onClose, onSave }) {
  const [task, setTask] = useState('');
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState('Belum Bisa');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) return;
    setTask(item.task || '');
    setDetail(item.detail || '');
    setStatus(item.status || 'Belum Bisa');
    setError('');
    setSaving(false);

    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;
  const isDraft = item.status === 'Draft';

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(item.id, task, detail, isDraft ? 'Draft' : status);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan.');
      setSaving(false);
    }
  }

  return (
    <div className="detail-modal" onClick={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <section className="detail-dialog" role="dialog" aria-modal="true">
        <div className="detail-modal-head">
          <div>
            <span className="detail-modal-kicker">
              {isDraft ? '✎ EDIT DRAFT' : '✎ EDIT TASK'}
            </span>
            <h2>{isDraft ? 'Edit Draft' : 'Edit Tugas'}</h2>
          </div>
          <button
            className="detail-close"
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Tutup pop-up"
          >
            ×
          </button>
        </div>

        <div className="detail-divider" />

        <form className="edit-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="editTaskName">{isDraft ? 'Nama Draft' : 'Nama Tugas'}</label>
            <input
              id="editTaskName"
              maxLength={200}
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="editTaskDetail">Detail</label>
            <textarea
              id="editTaskDetail"
              maxLength={2000}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Tambahkan catatan atau detail..."
            />
          </div>

          {!isDraft && (
            <div>
              <label htmlFor="editTaskStatus">Status</label>
              <select
                id="editTaskStatus"
                value={STATUSES.includes(status) ? status : 'Belum Bisa'}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="edit-error">{error}</p>}

          <div className="edit-actions">
            <button
              className="confirm-cancel"
              type="button"
              disabled={saving}
              onClick={onClose}
            >
              Batal
            </button>
            <button className="edit-save" type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function SuccessModal({ info, onClose, onGoList }) {
  useEffect(() => {
    if (!info) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [info, onClose]);

  if (!info) return null;

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section className="confirm-dialog" role="dialog" aria-modal="true">
        <div className="confirm-top">
          <div className="success-icon">✓</div>
          <div className="confirm-copy">
            <h2>{info.title}</h2>
            <p>{info.message}</p>
          </div>
          <button className="confirm-x" type="button" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        <div className="confirm-actions">
          <button className="confirm-cancel" type="button" onClick={onClose}>
            Tambah Lagi
          </button>
          {onGoList && (
            <button className="success-yes" type="button" onClick={onGoList}>
              Lihat Daftar Tugas
            </button>
          )}
        </div>
      </section>
    </div>
  );
}