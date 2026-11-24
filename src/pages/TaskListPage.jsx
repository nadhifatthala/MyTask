import { useEffect, useState } from 'react';
import {
  STATUSES,
  getTasks,
  getDrafts,
  updateTask,
  updateTaskStatus,
  deleteItem,
  moveTaskToDraft,
  moveDraftToTask,
} from '../supabaseClient';
import BrandHeader from '../components/BrandHeader';
import { DetailModal, ConfirmDeleteModal, EditTaskModal } from '../components/Modals';

const FILTER_DEFS = [
  ['Semua', 'Semua'],
  ['Draft', 'Draft'],
  ['Belum Bisa', 'Belum Bisa'],
  ['Proses', 'Proses'],
  ['Sudah bisa', 'Sudah bisa'],
  ['Berhasil', 'Berhasil'],
];

const GROUPS = [
  { status: 'Proses', title: 'Dalam Proses', cls: 'group-proses' },
  { status: 'Sudah bisa', title: 'Sudah Bisa Dikerjakan', cls: 'group-sudah' },
  { status: 'Belum Bisa', title: 'Belum Bisa Dikerjakan', cls: 'group-belum' },
  { status: 'Berhasil', title: 'Berhasil', cls: 'group-berhasil' },
  { status: 'Draft', title: 'Draft', cls: 'group-draft' },
];

export default function TaskListPage({ onGoInput }) {
  const [tasks, setTasks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadAll() {
    try {
      setErrorMsg('');
      const [tData, dData] = await Promise.all([getTasks(), getDrafts()]);
      setTasks(tData);
      setDrafts(dData);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat task.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const activeCount = tasks.filter((t) => t.status === 'Sudah bisa' || t.status === 'Proses').length;
  const blockedCount = tasks.filter((t) => t.status === 'Belum Bisa').length;
  const doneCount = tasks.filter((t) => t.status === 'Berhasil').length;
  const progressPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const q = search.trim().toLowerCase();
  const filteredTasks =
    filter === 'Draft'
      ? []
      : tasks.filter(
          (t) =>
            (filter === 'Semua' || t.status === filter) &&
            `${t.task} ${t.detail}`.toLowerCase().includes(q)
        );

  const filteredDrafts =
    filter !== 'Semua' && filter !== 'Draft'
      ? []
      : drafts.filter((d) => `${d.task} ${d.detail}`.toLowerCase().includes(q));

  async function handleStatusChange(id, newStatus) {
    setBusyId(id);
    try {
      await updateTaskStatus(id, newStatus);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Status gagal diperbarui.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveEdit(id, taskName, taskDetail, taskStatus) {
    await updateTask(id, taskName, taskDetail, taskStatus);
    await loadAll();
  }

  async function handleToDraft(id) {
    setBusyId(id);
    try {
      await moveTaskToDraft(id);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Gagal memindahkan task ke Draft.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDraftToTask(id) {
    setBusyId(id);
    try {
      await moveDraftToTask(id);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Gagal memindahkan draft.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    setBusyId(id);
    try {
      await deleteItem(id);
      await loadAll();
    } catch (err) {
      alert(err.message || 'Item gagal dihapus.');
    } finally {
      setBusyId(null);
    }
  }

  const visibleGroups = GROUPS.filter((g) => {
    if (filter !== 'Semua' && g.status !== filter) return false;
    const items = g.status === 'Draft' ? filteredDrafts : filteredTasks.filter((t) => t.status === g.status);
    return items.length > 0;
  });

  return (
    <main className="page-wrap">
      <BrandHeader subtitle="Daftar Tugas" />

      <section className="dashboard">
        <div className="today">{todayLabel}</div>
        <div className="hero-number">
          <strong>{activeCount}</strong>
          <span>
            tugas perlu
            <br />
            diselesaikan
          </span>
        </div>
        <p>
          <b>{blockedCount}</b> tugas belum bisa dikerjakan
        </p>
        <div className="progressbar">
          <div style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <nav className="filters" aria-label="Filter status">
        {FILTER_DEFS.map(([label, value]) => {
          const count =
            value === 'Semua'
              ? tasks.length + drafts.length
              : value === 'Draft'
              ? drafts.length
              : tasks.filter((t) => t.status === value).length;

          return (
            <button
              key={value}
              type="button"
              className={`chip ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </nav>

      <label className="searchbox">
        <span>⌕</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tugas atau detail..."
        />
        <button type="button" onClick={() => setSearch('')} aria-label="Hapus pencarian">
          ☷
        </button>
      </label>

      <section className="cards">
        {loading ? (
          <div className="empty">Memuat daftar tugas...</div>
        ) : errorMsg ? (
          <div className="empty">Gagal memuat task: {errorMsg}</div>
        ) : visibleGroups.length === 0 ? (
          <div className="empty">
            {tasks.length + drafts.length
              ? 'Tidak ada task yang cocok.'
              : 'Belum ada task. Tekan “Tugas Baru” untuk menambahkan.'}
          </div>
        ) : (
          visibleGroups.map((g) => {
            const isDraftGroup = g.status === 'Draft';
            const items = isDraftGroup
              ? filteredDrafts
              : filteredTasks.filter((t) => t.status === g.status);

            return (
              <section key={g.status} className={`group ${g.cls}`}>
                <div className="grouphead">
                  <span>{g.title}</span>
                  <span className="groupcount">{items.length} task</span>
                </div>

                {items.map((item) => {
                  const isDone = !isDraftGroup && item.status === 'Berhasil';
                  const isBusy = busyId === item.id;

                  return (
                    <article key={item.id} className="card">
                      <div className="cardtop">
                        <div className={`circle ${isDone ? 'done' : ''}`}>
                          {isDone ? '✓' : ''}
                        </div>
                        <div className="maintext">
                          <div className="tasktitle">{item.task}</div>
                        </div>
                      </div>

                      <div className="cardbottom">
                        <span className="tag">{isDraftGroup ? 'Draft' : 'Task'}</span>

                        {item.detail && (
                          <button
                            type="button"
                            className="detail-btn"
                            onClick={() => setDetailItem(item)}
                          >
                            Detail
                          </button>
                        )}

                        {!isDraftGroup && item.status === 'Belum Bisa' && (
                          <button
                            type="button"
                            className="draft-action"
                            disabled={isBusy}
                            onClick={() => handleToDraft(item.id)}
                          >
                            Jadikan Draft
                          </button>
                        )}

                        {isDraftGroup ? (
                          <button
                            type="button"
                            className="draft-action"
                            disabled={isBusy}
                            onClick={() => handleDraftToTask(item.id)}
                          >
                            Pindahkan ke Task
                          </button>
                        ) : (
                          <select
                            className="statusselect"
                            value={STATUSES.includes(item.status) ? item.status : 'Belum Bisa'}
                            disabled={isBusy}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}

                        <button
                          type="button"
                          className="edit-action"
                          disabled={isBusy}
                          onClick={() => setEditItem(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-action"
                          disabled={isBusy}
                          onClick={() =>
                            setDeleteTarget({ id: item.id, kind: isDraftGroup ? 'draft' : 'task' })
                          }
                        >
                          Hapus
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })
        )}
      </section>

      <button type="button" className="fab" onClick={onGoInput}>
        <b>＋</b> Tugas Baru
      </button>

      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      <EditTaskModal
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleSaveEdit}
      />
      <ConfirmDeleteModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}