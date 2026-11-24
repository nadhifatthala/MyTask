import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STATUSES = ['Belum Bisa', 'Sudah bisa', 'Berhasil', 'Proses'];

// Mengambil semua task (non-draft)
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .neq('status', 'Draft')
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Menambah task baru
export async function addTask(task, detail, status) {
  const cleanTask = String(task || '').trim().slice(0, 200);
  const cleanDetail = String(detail || '').trim().slice(0, 2000);
  if (!cleanTask) throw new Error('Nama task wajib diisi.');
  if (!STATUSES.includes(status)) throw new Error('Status tidak valid.');

  const { error } = await supabase
    .from('tasks')
    .insert([{ task: cleanTask, detail: cleanDetail, status }]);
  if (error) throw error;
}

// Mengubah status task
export async function updateTaskStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error('Status tidak valid.');
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

// Menghapus task atau draft
export async function deleteItem(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// Memindahkan task ke Draft
export async function moveTaskToDraft(id) {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'Draft' })
    .eq('id', id);
  if (error) throw error;
}

// Mengambil semua Draft
export async function getDrafts() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'Draft')
    .order('id', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Menambah Draft baru
export async function addDraft(task, detail) {
  const cleanTask = String(task || '').trim().slice(0, 200);
  const cleanDetail = String(detail || '').trim().slice(0, 2000);
  if (!cleanTask) throw new Error('Nama draft wajib diisi.');

  const { error } = await supabase
    .from('tasks')
    .insert([{ task: cleanTask, detail: cleanDetail, status: 'Draft' }]);
  if (error) throw error;
}

// Memindahkan Draft ke Task (default: 'Belum Bisa', sesuai code.gs)
export async function moveDraftToTask(id) {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'Belum Bisa' })
    .eq('id', id);
  if (error) throw error;
}
// Mengedit judul, detail, dan status task/draft
export async function updateTask(id, task, detail, status) {
  const cleanTask = String(task || '').trim().slice(0, 200);
  const cleanDetail = String(detail || '').trim().slice(0, 2000);
  if (!cleanTask) throw new Error('Nama task wajib diisi.');
  if (status !== 'Draft' && !STATUSES.includes(status)) {
    throw new Error('Status tidak valid.');
  }

  const { error } = await supabase
    .from('tasks')
    .update({ task: cleanTask, detail: cleanDetail, status })
    .eq('id', id);
  if (error) throw error;
}
// Login dengan email & password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}