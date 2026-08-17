'use client';

import { useEffect, useState, useRef } from 'react';
import { tasksApi, commentsApi, checklistsApi, attachmentsApi, timeTrackingApi, activitiesApi, projectsApi, getAttachmentUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY12h } from '@/lib/format';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { Paperclip } from 'lucide-react';

interface Task {
  id: number; title: string; description?: string; priority: string;
  status: string; dueDate?: string; startDate?: string;
  assigneeName?: string; assigneeId?: number; estimatedHours?: number; actualHours?: number;
  coverColor?: string; commentCount: number; checklistTotal: number; checklistDone: number;
}
interface Comment {
  id: number; content: string; userName?: string; createdAt: string; isEdited: boolean;
  attachments?: Attachment[];
}
interface Label { id: number; name: string; color: string; }
interface ChecklistItem { id: number; title: string; isChecked: boolean; }
interface Checklist { id: number; name: string; items: ChecklistItem[]; }
interface Attachment { id: number; name: string; url: string; size?: number; mimeType?: string; createdAt: string; }
interface TimeEntry { id: number; hours: number; description?: string; userName?: string; loggedDate: string; }
interface ActivityItem { id: number; type: string; data?: string; userName?: string; createdAt: string; }

const priorityColors: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#22c55e',
};

const formatActivity = (type: string, data?: string) => {
  if (!data) {
    if (type === 'task_archived') return 'archived this task';
    if (type === 'task_created') return 'created this task';
    return type.replace(/_/g, ' ');
  }

  if (data.startsWith('{') && data.endsWith('}')) {
    try {
      const parsed = JSON.parse(data);
      if (type === 'task_created') {
        return 'created this task';
      }
      if (type === 'task_status_changed') {
        const from = (parsed.from || '').replace(/_/g, ' ');
        const to = (parsed.to || '').replace(/_/g, ' ');
        return `changed status from "${from}" to "${to}"`;
      }
      if (type === 'task_moved') {
        if (parsed.from && parsed.to) {
          return `moved this task from "${parsed.from}" to "${parsed.to}"`;
        }
        if (parsed.to) {
          return `moved this task to "${parsed.to}"`;
        }
        return 'moved this task';
      }
    } catch {
      return data;
    }
  }

  return data;
};

export default function TaskDetailDrawer({ taskId, projectId, boardOwnerId, onClose }: { taskId: number; projectId?: number; boardOwnerId?: number; onClose: () => void }) {
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('task.edit') || user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin');
  const [task, setTask] = useState<Task | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentFiles, setCommentFiles] = useState<{ id: number; name: string }[]>([]);
  const [uploadingCommentFile, setUploadingCommentFile] = useState(false);
  const [localDesc, setLocalDesc] = useState('');
  const prevTaskId = useRef<number | null>(null);

  useEffect(() => {
    if (task && (prevTaskId.current !== taskId || localDesc === '')) {
      setLocalDesc(task.description ?? '');
      prevTaskId.current = taskId;
    }
  }, [task, taskId]);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newItemTitle, setNewItemTitle] = useState<Record<number, string>>({});
  const [logHours, setLogHours] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklists' | 'attachments' | 'time' | 'comments' | 'activity'>('overview');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectOwnerId, setProjectOwnerId] = useState<number | null>(null);

  const isOwner = user?.roles?.includes('Super Admin') || (projectOwnerId && user?.id === projectOwnerId) || (boardOwnerId && user?.id === boardOwnerId);

  const initDatepicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    const loadAndInit = async () => {
      const loadScript = (src: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.body.appendChild(script);
        });
      };

      try {
        if (!document.getElementById('jquery-ui-css')) {
          const link = document.createElement('link');
          link.id = 'jquery-ui-css';
          link.rel = 'stylesheet';
          link.href = 'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css';
          document.head.appendChild(link);
        }

        if (!(window as any).$) {
          await loadScript('https://code.jquery.com/jquery-3.7.1.min.js');
        }
        if (!(window as any).$.ui) {
          await loadScript('https://code.jquery.com/ui/1.13.2/jquery-ui.min.js');
        }

        const $ = (window as any).$;
        $(el).datepicker({
          dateFormat: 'dd-mm-yy',
          onSelect: (dateText: string) => {
            if (dateText) {
              const parts = dateText.split('-');
              if (parts.length === 3) {
                const yyyymmdd = `${parts[2]}-${parts[1]}-${parts[0]}`;
                saveField('dueDate', yyyymmdd);
                return;
              }
            }
            saveField('dueDate', dateText || null);
          }
        });
      } catch (err) {
        console.error('Failed to load datepicker', err);
      }
    };
    loadAndInit();
  };

  const loadData = () => {
    setLoading(true);
    const promises: Promise<any>[] = [
      tasksApi.getById(taskId),
      commentsApi.getByTask(taskId),
      checklistsApi.getByTask(taskId),
      attachmentsApi.getByTask(taskId),
      timeTrackingApi.getByTask(taskId),
      activitiesApi.getByTask(taskId),
    ];

    if (projectId) {
      promises.push(projectsApi.getMembers(projectId));
      promises.push(projectsApi.getById(projectId));
    }

    const getVal = (result: PromiseSettledResult<any>) =>
      result.status === 'fulfilled' ? result.value : null;

    Promise.allSettled(promises).then((results) => {
      const [taskRes, cmtRes, chkRes, attRes, timeRes, actRes, membersRes, projRes] = results.map(getVal);

      if (taskRes) {
        const data = taskRes.data.data;
        const t = data && data.task ? data.task : data;
        const l = data && data.labels ? data.labels : [];
        setTask(t);
        if (t) setTitleValue(t.title);
        setLabels(l ?? []);
      }
      setComments(cmtRes?.data?.data ?? []);
      setChecklists(chkRes?.data?.data ?? []);
      setAttachments(attRes?.data?.data ?? []);
      setTimeEntries(timeRes?.data?.data ?? []);
      setActivities(actRes?.data?.data ?? []);
      if (membersRes) {
        setProjectMembers(membersRes?.data?.data ?? []);
      }
      if (projRes) {
        setProjectOwnerId(projRes?.data?.data?.ownerId ?? null);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [taskId, projectId]);

  const saveField = async (field: string, value: unknown) => {
    if (!task) return;
    setSaving(true);
    try {
      await tasksApi.update(taskId, { [field]: value });
      setTask(prev => prev ? { ...prev, [field]: value } : prev);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'You do not have permission to perform this action.');
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleCommentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingCommentFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await attachmentsApi.upload(taskId, files[i]);
        const uploaded = res.data.data;
        setCommentFiles(prev => [...prev, { id: uploaded.id, name: uploaded.name }]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload comment file.');
    } finally {
      setUploadingCommentFile(false);
    }
  };

  const removeCommentFile = async (id: number) => {
    try {
      await attachmentsApi.delete(id);
      setCommentFiles(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete file.');
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const attachmentIds = commentFiles.map(f => f.id);
      await commentsApi.create({ taskId, content: newComment.trim(), attachmentIds });
      const res = await commentsApi.getByTask(taskId);
      setComments(res.data.data);
      setNewComment('');
      setCommentFiles([]);
      const attRes = await attachmentsApi.getByTask(taskId);
      setAttachments(attRes.data.data ?? []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add comment.');
    }
  };

  const deleteComment = async (id: number) => {
    try {
      await commentsApi.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const deleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'You do not have permission to delete this task.');
    }
  };

  const createChecklist = async () => {
    if (!newChecklistName.trim()) return;
    try {
      await checklistsApi.create({ taskId, name: newChecklistName.trim() });
      setNewChecklistName('');
      const res = await checklistsApi.getByTask(taskId);
      setChecklists(res.data.data ?? []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create checklist.');
    }
  };

  const addChecklistItem = async (checklistId: number) => {
    const title = newItemTitle[checklistId]?.trim();
    if (!title) return;
    try {
      await checklistsApi.addItem(checklistId, { title });
      setNewItemTitle(prev => ({ ...prev, [checklistId]: '' }));
      const res = await checklistsApi.getByTask(taskId);
      setChecklists(res.data.data ?? []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add checklist item.');
    }
  };

  const toggleChecklistItem = async (itemId: number, current: boolean) => {
    try {
      await checklistsApi.toggleItem(itemId, !current);
      setChecklists(prev => prev.map(c => ({
        ...c,
        items: c.items.map(i => i.id === itemId ? { ...i, isChecked: !current } : i)
      })));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update checklist item.');
    }
  };

  const deleteChecklist = async (id: number) => {
    try {
      await checklistsApi.delete(id);
      setChecklists(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete checklist.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await attachmentsApi.upload(taskId, file);
      const res = await attachmentsApi.getByTask(taskId);
      setAttachments(res.data.data ?? []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (id: number) => {
    try {
      await attachmentsApi.delete(id);
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete attachment.');
    }
  };

  const submitTimeLog = async () => {
    const hrs = parseFloat(logHours);
    if (!hrs || hrs <= 0) return;
    try {
      await timeTrackingApi.logTime({ taskId, hours: hrs, description: logDesc });
      setLogHours('');
      setLogDesc('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log time.');
    }
  };

  const deleteTimeEntry = async (id: number) => {
    try {
      await timeTrackingApi.delete(id);
      setTimeEntries(prev => prev.filter(t => t.id !== id));
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete time entry.');
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />

      <div className="drawer" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div style={{ padding: 32 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 32, marginBottom: 16, borderRadius: 8 }} />)}
          </div>
        ) : task ? (
          <>
            {task.coverColor && (
              <div style={{ height: 8, background: task.coverColor }} />
            )}

            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  {editingTitle && canEdit ? (
                    <input
                      className="input"
                      value={titleValue}
                      onChange={e => setTitleValue(e.target.value)}
                      onBlur={() => { saveField('title', titleValue); setEditingTitle(false); }}
                      onKeyDown={e => { if (e.key === 'Enter') { saveField('title', titleValue); setEditingTitle(false); } }}
                      style={{ fontSize: 20, fontWeight: 700, padding: '4px 8px' }}
                      autoFocus
                      maxLength={100}
                    />
                  ) : (
                    <h2
                      style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, cursor: canEdit ? 'text' : 'default' }}
                      onClick={() => canEdit && setEditingTitle(true)}
                    >
                      {task.title}
                    </h2>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {isOwner && (
                    <button
                      onClick={deleteTask}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--danger)',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--danger)';
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--danger)';
                      }}
                    >
                      Delete Task
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 8, borderRadius: 8, fontSize: 20, lineHeight: 1 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >×</button>
                </div>
              </div>

              {labels.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {labels.map(l => (
                    <span key={l.id} style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: `${l.color}33`, color: l.color, border: `1px solid ${l.color}44`,
                    }}>
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', padding: '0 28px', overflowX: 'auto' }}>
              {(['overview', 'checklists', 'attachments', 'time', 'comments', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '12px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  background: 'none', borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'all 0.2s', textTransform: 'capitalize', whiteSpace: 'nowrap'
                }}>
                  {tab === 'time' ? 'Time Log' : tab}
                  {tab === 'comments' && comments.length > 0 && ` (${comments.length})`}
                  {tab === 'checklists' && checklists.length > 0 && ` (${checklists.length})`}
                  {tab === 'attachments' && attachments.length > 0 && ` (${attachments.length})`}
                  {tab === 'time' && timeEntries.length > 0 && ` (${timeEntries.reduce((acc, curr) => acc + curr.hours, 0)}h)`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>

              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      {
                        label: 'Priority', value: (
                          <select
                            className="input"
                            value={task.priority}
                            onChange={e => saveField('priority', e.target.value)}
                            disabled={!canEdit}
                            style={{ fontSize: 13, color: priorityColors[task.priority] ?? 'inherit' }}
                          >
                            {['critical', 'high', 'medium', 'low'].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        )
                      },
                      {
                        label: 'Status', value: (
                          <select
                            className="input"
                            value={task.status}
                            onChange={e => saveField('status', e.target.value)}
                            disabled={!canEdit}
                            style={{ fontSize: 13 }}
                          >
                            {['todo', 'in_progress', 'review', 'testing', 'done', 'cancelled'].map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        )
                      },
                      {
                        label: 'Due Date', value: (
                          <input
                            type="text"
                            ref={initDatepicker}
                            className="input"
                            style={{ fontSize: 13 }}
                            placeholder="DD-MM-YYYY"
                            defaultValue={task.dueDate ? formatDateDDMMYYYY(task.dueDate) : ''}
                            disabled={!canEdit}
                          />
                        )
                      },
                      {
                        label: 'Assignee', value: (
                          <select
                            className="input"
                            value={task.assigneeId || ''}
                            disabled={!canEdit}
                            onChange={e => {
                              const val = e.target.value ? Number(e.target.value) : null;
                              saveField('assigneeId', val);
                            }}
                            style={{ fontSize: 13 }}
                          >
                            <option value="">Unassigned</option>
                            {projectMembers.map(m => (
                              <option key={m.userId} value={m.userId}>
                                {m.userName} ({m.userEmail})
                              </option>
                            ))}
                          </select>
                        )
                      },
                      {
                        label: 'Estimated (hrs)', value: (
                          <input type="number" className="input" style={{ fontSize: 13 }}
                            defaultValue={task.estimatedHours ?? ''}
                            disabled={!canEdit}
                            onBlur={e => saveField('estimatedHours', parseFloat(e.target.value) || null)}
                          />
                        )
                      },
                      {
                        label: 'Actual (hrs)', value: (
                          <input type="number" className="input" style={{ fontSize: 13 }}
                            value={task.actualHours ?? 0}
                            readOnly
                          />
                        )
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</p>
                        {value}
                      </div>
                    ))}
                  </div>

                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Description</p>
                    <RichTextEditor
                      value={localDesc}
                      onChange={setLocalDesc}
                      placeholder="Add a description..."
                      readOnly={!canEdit}
                    />
                    {canEdit && localDesc !== (task.description ?? '') && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={async () => {
                            await saveField('description', localDesc || null);
                          }}
                        >
                          Save
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => setLocalDesc(task.description ?? '')}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Checklists Tab */}
              {activeTab === 'checklists' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="input"
                      placeholder="Checklist name..."
                      value={newChecklistName}
                      onChange={e => setNewChecklistName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createChecklist()}
                      maxLength={50}
                    />
                    <button className="btn btn-primary btn-sm" onClick={createChecklist} disabled={!newChecklistName.trim()}>
                      Add Checklist
                    </button>
                  </div>

                  {checklists.map(c => (
                    <div key={c.id} style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</h4>
                        <button onClick={() => deleteChecklist(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                        {c.items.map(item => (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                            <input
                              type="checkbox"
                              checked={item.isChecked}
                              onChange={() => toggleChecklistItem(item.id, item.isChecked)}
                            />
                            <span style={{ textDecoration: item.isChecked ? 'line-through' : 'none', color: item.isChecked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                              {item.title}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          className="input"
                          placeholder="Add item..."
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          value={newItemTitle[c.id] || ''}
                          onChange={e => setNewItemTitle({ ...newItemTitle, [c.id]: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && addChecklistItem(c.id)}
                          maxLength={100}
                        />
                        <button className="btn btn-secondary btn-sm" onClick={() => addChecklistItem(c.id)}>Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {attachments.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No attachments uploaded.</p>
                    ) : attachments.map(att => (
                      <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div>
                          <a href={getAttachmentUrl(att.url)} target="_blank" rel="noreferrer" style={{ fontWeight: 500, fontSize: 13, color: 'var(--accent)' }}>{att.name}</a>
                          {att.size && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>({(att.size / 1024).toFixed(1)} KB)</span>}
                        </div>
                        <button onClick={() => deleteAttachment(att.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Tracking Tab */}
              {activeTab === 'time' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h4 style={{ fontWeight: 600, fontSize: 14 }}>Log Time</h4>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="number"
                        step="0.5"
                        className="input"
                        placeholder="Hours (e.g. 2.5)"
                        style={{ width: 140, fontSize: 13 }}
                        value={logHours}
                        onChange={e => setLogHours(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Work description..."
                        style={{ fontSize: 13 }}
                        value={logDesc}
                        onChange={e => setLogDesc(e.target.value)}
                        maxLength={200}
                      />
                      <button className="btn btn-primary btn-sm" onClick={submitTimeLog} disabled={!logHours}>
                        Log
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {timeEntries.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No time logged yet.</p>
                    ) : timeEntries.map(entry => (
                      <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <strong style={{ fontSize: 14, color: 'var(--accent)' }}>{entry.hours} hrs</strong>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {entry.userName || 'User'}</span>
                          </div>
                          {entry.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{entry.description}</p>}
                        </div>
                        <button onClick={() => deleteTimeEntry(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments tab */}
              {activeTab === 'comments' && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff',
                      }}>
                        {user?.firstName?.[0]}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <RichTextEditor
                          value={newComment}
                          onChange={setNewComment}
                          placeholder="Add a comment..."
                        />
                        
                        {commentFiles.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attached files:</p>
                            {commentFiles.map(f => (
                              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                <span>📎 {f.name}</span>
                                <button type="button" onClick={() => removeCommentFile(f.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 11 }}>Remove</button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Paperclip size={14} />
                            {uploadingCommentFile ? 'Uploading...' : 'Attach File'}
                            <input type="file" multiple onChange={handleCommentFileUpload} style={{ display: 'none' }} disabled={uploadingCommentFile} />
                          </label>
                          <button className="btn btn-primary btn-sm" onClick={postComment} disabled={!newComment.trim() || uploadingCommentFile}>
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {comments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: 24, marginBottom: 8 }}>💬</p>
                        <p>No comments yet. Start the conversation!</p>
                      </div>
                    ) : comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff',
                        }}>
                          {(c.userName ?? 'U')[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{c.userName}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {formatDateTimeDDMMYYYY12h(c.createdAt)}
                            </span>
                            {c.isEdited && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(edited)</span>}
                          </div>
                          <div 
                            style={{
                              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                              borderRadius: 10, padding: '12px 14px', fontSize: 14, lineHeight: 1.6,
                            }}
                            className="rte-content"
                            dangerouslySetInnerHTML={{ __html: c.content }}
                          />
                          {c.attachments && c.attachments.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                              {c.attachments.map(att => (
                                <a 
                                  key={att.id} 
                                  href={getAttachmentUrl(att.url)} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 12,
                                    padding: '4px 8px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    color: 'var(--accent)',
                                    textDecoration: 'none'
                                  }}
                                >
                                  📎 {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => deleteComment(c.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', marginTop: 6, padding: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity tab */}
              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: 32, marginBottom: 8 }}>📜</p>
                      <p>No activity logged for this task yet.</p>
                    </div>
                  ) : activities.map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 16 }}>⚡</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>
                          <strong>{act.userName || 'System'}</strong> {formatActivity(act.type, act.data)}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {formatDateTimeDDMMYYYY12h(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Task not found</div>
        )}
      </div>
    </>
  );
}
