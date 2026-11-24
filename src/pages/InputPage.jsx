import { useEffect, useState } from 'react';
import {
  STATUSES,
  addTask,
  getDrafts,
  addDraft,
  deleteItem,
  moveDraftToTask,
} from '../supabaseClient';
import BrandHeader from '../components/BrandHeader';
import { SuccessModal } from '../components/Modals';

export default function InputPage({ onBack }) {
  const [view, setView] = useState('task');

  // State Form Task
  const [task, setTask] = useState('');
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState('Belum Bisa');
  const [savingTask, setSavingTask] = useState(false);
  const [taskMsg, setTaskMsg] = useState({ text: '', color: '#178454' });

  // State Form & List Draft
  const [draftTask, setDraftTask] = useState('');
  const [draftDetail, setDraftDetail] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMsg, setDraftMsg] = useState({ text: '', color: '#178454' });
  const [drafts, setDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [busyDraftId, setBusyDraftId] = useState(null);

  // State Pop-up Berhasil Input
  const [successInfo, setSuccessInfo] = useState(null);

  async function loadDrafts() {
    setLoadingDrafts(true);
    try {
      const data = await getDrafts();
      setDrafts(data);
    } catch (err) {
      setDraftMsg({ text: err.message || 'Gagal memuat draft.', color: '#b42318' });
    } finally {
      setLoadingDrafts(false);
    }
  }

  useEffect(() => {
    if (view === 'draft') loadDrafts();
  }, [view]);

  async function handleSubmitTask(e) {
    e.preventDefault();
    const savedTitle = task.trim();
    const savedStatus = status;

    setSavingTask(true);
    setTaskMsg({ text: 'Menyimpan…', color: '#64748b' });
    try {
      await addTask(task, detail, status);
      setTask('');
      setDetail('');
      setStatus('Belum Bisa');
      setTaskMsg({ text: '', color: '#16895b' });
      setSuccessInfo({
        title: 'Task Berhasil Disimpan!',
        message: `"${savedTitle}" telah ditambahkan ke daftar tugas (Status: ${savedStatus}).`,
      });
    } catch (err) {
      setTaskMsg({ text: err.message || 'Gagal menyimpan task.', color: '#b42318' });
    } finally {
      setSavingTask(false);
    }
  }

  async function handleSubmitDraft(e) {
    e.preventDefault();
    const savedTitle = draftTask.trim();

    setSavingDraft(true);
    setDraftMsg({ text: 'Menyimpan draft…', color: '#64748b' });
    try {
      await addDraft(draftTask, draftDetail);
      setDraftTask('');
      setDraftDetail('');
      setDraftMsg({ text: '', color: '#178454' });
      await loadDrafts();
      setSuccessInfo({
        title: 'Draft Berhasil Disimpan!',
        message: `"${savedTitle}" telah tersimpan di Draft Sementara.`,
      });
    } catch (err) {
      setDraftMsg({ text: err.message || 'Gagal menyimpan draft.', color: '#b42318' });
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleMoveDraft(id) {
    setBusyDraftId(id);
    try {
      await moveDraftToTask(id);
      setDraftMsg({ text: 'Draft dipindahkan ke daftar task.', color: '#178454' });
      await loadDrafts();
    } catch (err) {
      setDraftMsg({ text: err.message || 'Gagal memindahkan draft.', color: '#b42318' });
    } finally {
      setBusyDraftId(null);
    }
  }

  async function handleDeleteDraft(id) {
    setBusyDraftId(id);
    try {
      await deleteItem(id);
      await loadDrafts();
    } catch (err) {
      setDraftMsg({ text: err.message || 'Gagal menghapus draft.', color: '#b42318' });
    } finally {
      setBusyDraftId(null);
    }
  }

  return (
    <main className="page-wrap input-mode">
      <BrandHeader subtitle="Input Tugas" />

      <h1 className="input-title">Tambah Tugas</h1>
      <p className="sub">Catat task baru atau simpan sementara sebagai draft.</p>
      <button type="button" className="back" onClick={onBack}>
        ← Kembali ke Daftar Tugas
      </button>

      <nav className="tabs" aria-label="Jenis input">
        <button
          type="button"
          className={`tab ${view === 'task' ? 'active' : ''}`}
          onClick={() => setView('task')}
        >
          Input Task
        </button>
        <button
          type="button"
          className={`tab ${view === 'draft' ? 'active' : ''}`}
          onClick={() => setView('draft')}
        >
          Draft Sementara
        </button>
      </nav>

      {view === 'task' ? (
        <section>
          <form className="panel" onSubmit={handleSubmitTask}>
            <div className="field">
              <label htmlFor="task">Nama Tugas</label>
              <input
                id="task"
                maxLength={200}
                required
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Contoh: Menyusun laporan"
              />
            </div>
            <div className="field">
              <label htmlFor="detail">Detail</label>
              <textarea
                id="detail"
                maxLength={2000}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Catatan atau keterangan tambahan"
              />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button className="primary" type="submit" disabled={savingTask}>
              {savingTask ? 'Menyimpan...' : '＋ Simpan Task'}
            </button>
            {taskMsg.text && (
              <p className="message" style={{ color: taskMsg.color }}>{taskMsg.text}</p>
            )}
          </form>
        </section>
      ) : (
        <section>
          <form className="panel" onSubmit={handleSubmitDraft}>
            <p className="hint">
              Draft disimpan sementara dan belum masuk ke daftar task aktif sampai dipindahkan.
            </p>
            <div className="field">
              <label htmlFor="draftTask">Nama Draft</label>
              <input
                id="draftTask"
                maxLength={200}
                required
                value={draftTask}
                onChange={(e) => setDraftTask(e.target.value)}
                placeholder="Contoh: Tindak lanjut rapat"
              />
            </div>
            <div className="field">
              <label htmlFor="draftDetail">Detail</label>
              <textarea
                id="draftDetail"
                maxLength={2000}
                value={draftDetail}
                onChange={(e) => setDraftDetail(e.target.value)}
                placeholder="Catatan sementara"
              />
            </div>
            <button className="primary" type="submit" disabled={savingDraft}>
              {savingDraft ? 'Menyimpan...' : 'Simpan Draft Sementara'}
            </button>
            {draftMsg.text && (
              <p className="message" style={{ color: draftMsg.color }}>{draftMsg.text}</p>
            )}
          </form>

          <section className="draft-list">
            {loadingDrafts ? (
              <div className="empty">Memuat draft…</div>
            ) : drafts.length === 0 ? (
              <div className="empty">Belum ada draft sementara.</div>
            ) : (
              drafts.map((d) => (
                <article key={d.id} className="draft-card">
                  <div className="draft-title">{d.task}</div>
                  {d.detail && <div className="draft-detail">{d.detail}</div>}
                  <div className="draft-actions">
                    <button
                      type="button"
                      className="move"
                      disabled={busyDraftId === d.id}
                      onClick={() => handleMoveDraft(d.id)}
                    >
                      Pindahkan ke Task
                    </button>
                    <button
                      type="button"
                      className="delete"
                      disabled={busyDraftId === d.id}
                      onClick={() => handleDeleteDraft(d.id)}
                    >
                      Hapus Draft
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      )}

      <SuccessModal
        info={successInfo}
        onClose={() => setSuccessInfo(null)}
        onGoList={() => {
          setSuccessInfo(null);
          onBack();
        }}
      />
    </main>
  );
}