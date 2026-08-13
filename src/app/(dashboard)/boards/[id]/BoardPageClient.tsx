'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { boardsApi, listsApi, tasksApi, projectsApi, usersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import TaskDetailDrawer from '@/components/board/TaskDetailDrawer';
import { formatDateIndian } from '@/lib/format';

interface Task {
  id: number; title: string; priority: string; status: string;
  position: number; listId: number; dueDate?: string;
  assigneeName?: string; assigneeAvatar?: string;
  commentCount: number; subtaskCount: number;
  checklistTotal: number; checklistDone: number;
  coverColor?: string;
}
interface List { id: number; name: string; color: string; position: number; tasks?: Task[]; wipLimit?: number; }
interface Board { id: number; name: string; projectId: number; }
interface BoardView { id: number; name: string; viewType: string; isDefault: boolean; }

const priorityConfig: Record<string, { color: string; icon: string }> = {
  critical: { color: '#dc2626', icon: '🔴' },
  high:     { color: '#f97316', icon: '🟠' },
  medium:   { color: '#f59e0b', icon: '🟡' },
  low:      { color: '#22c55e', icon: '🟢' },
};

export default function BoardPageClient() {
  const { id } = useParams<{ id: string }>();
  const { user, workspaceId } = useAuth();
  const isSuperAdmin = user?.roles?.includes('Super Admin');
  
  // Resolve boardId. If NaN (e.g. during static generation or after rewrite), try reading from pathname.
  let boardId = parseInt(id);
  if (isNaN(boardId) && typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    boardId = parseInt(lastPart);
  }

  const [board, setBoard] = useState<Board | null>(null);
  const [views, setViews] = useState<BoardView[]>([]);
  const [activeView, setActiveView] = useState('kanban');
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [addingTaskListId, setAddingTaskListId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editingListName, setEditingListName] = useState('');

  // Members state
  const [showMembers, setShowMembers] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedAddUserId, setSelectedAddUserId] = useState<number | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const handleOpenMembers = async () => {
    if (!board?.projectId) return;
    setShowMembers(true);
    setLoadingMembers(true);
    setSelectedAddUserId(null);
    try {
      const [membersRes, usersRes] = await Promise.all([
        projectsApi.getMembers(board.projectId),
        usersApi.getAll(workspaceId || undefined)
      ]);
      setProjectMembers(membersRes.data.data ?? []);
      setAllUsers(usersRes.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadBoard = useCallback(async () => {
    if (isNaN(boardId)) return;
    setLoading(true);
    try {
      const [boardRes, tasksRes] = await Promise.all([
        boardsApi.getById(boardId),
        tasksApi.getByBoard(boardId),
      ]);
      const b = boardRes.data.data;
      const allTasks: Task[] = tasksRes.data.data;
      setBoard(b);

      const listsRes = await listsApi.getByBoard(boardId);
      const rawLists: List[] = listsRes.data.data;
      const listsWithTasks = rawLists.map(l => ({
        ...l,
        tasks: allTasks.filter(t => t.listId === l.id).sort((a, b) => a.position - b.position),
      }));
      setLists(listsWithTasks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [boardId]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (isNaN(boardId)) return;
    loadBoard().then(() => {
      const tId = searchParams.get('taskId');
      if (tId) {
        const parsed = parseInt(tId);
        if (!isNaN(parsed)) {
          setSelectedTaskId(parsed);
        }
      }
    });
  }, [loadBoard, boardId]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = parseInt(draggableId);
    const destListId = parseInt(destination.droppableId);

    // Optimistic update
    setLists(prev => {
      const next = prev.map(l => ({ ...l, tasks: [...(l.tasks ?? [])] }));
      let task: Task | undefined;
      next.forEach(l => {
        const idx = l.tasks!.findIndex(t => t.id === taskId);
        if (idx !== -1) { task = l.tasks!.splice(idx, 1)[0]; }
      });
      if (task) {
        const destList = next.find(l => l.id === destListId);
        if (destList) {
          task.listId = destListId;
          destList.tasks!.splice(destination.index, 0, task);
        }
      }
      return next;
    });

    // Get new position
    const destList = lists.find(l => l.id === destListId);
    const destTasks = destList?.tasks ?? [];
    const prev = destTasks[destination.index - 1]?.position ?? 0;
    const next = destTasks[destination.index + 1]?.position ?? (prev + 2);
    const newPos = (prev + next) / 2;

    try {
      await tasksApi.move(taskId, destListId, newPos);
    } catch { loadBoard(); }
  };

  const addList = async () => {
    if (!newListName.trim()) return;
    await listsApi.create({ boardId, name: newListName.trim(), color: '#6366f1' });
    setNewListName('');
    setAddingList(false);
    loadBoard();
  };

  const renameList = async (listId: number) => {
    if (!editingListName.trim()) {
      setEditingListId(null);
      return;
    }
    setLists(prev => prev.map(l => l.id === listId ? { ...l, name: editingListName } : l));
    setEditingListId(null);
    try {
      await listsApi.update(listId, { name: editingListName.trim() });
    } catch (e) {
      console.error(e);
      loadBoard();
    }
  };

  const addTask = async (listId: number) => {
    if (!newTaskTitle.trim()) return;
    try {
      await tasksApi.create({
        listId, boardId, projectId: board?.projectId,
        title: newTaskTitle.trim(), priority: 'medium',
      });
      setNewTaskTitle('');
      setAddingTaskListId(null);
      loadBoard();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to add task');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', gap: 16, padding: 24, overflowX: 'auto' }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="skeleton" style={{ width: 300, height: 400, borderRadius: 12, flexShrink: 0 }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Board header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-secondary)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{board?.name}</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {['kanban', 'table', 'calendar'].map(vt => (
            <button key={vt}
              onClick={() => setActiveView(vt)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s', textTransform: 'capitalize',
                background: activeView === vt ? 'var(--accent)' : 'var(--bg-hover)',
                color: activeView === vt ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {vt === 'kanban' ? '📋 Kanban' : vt === 'table' ? '📊 Table' : '📅 Calendar'}
            </button>
          ))}
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleOpenMembers}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)',
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            👥 Members
          </button>
        )}
      </div>

      {/* Kanban Board */}
      {activeView === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">
            {lists.map(list => (
              <div key={list.id} className="kanban-column">
                {/* Column header */}
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: list.color, flexShrink: 0 }} />
                    {editingListId === list.id ? (
                      <input
                        className="input"
                        style={{
                          fontSize: 13,
                          height: 26,
                          width: 130,
                          padding: '2px 8px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                        }}
                        value={editingListName}
                        onChange={e => setEditingListName(e.target.value)}
                        onBlur={() => renameList(list.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameList(list.id);
                          if (e.key === 'Escape') setEditingListId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                        onClick={() => {
                          setEditingListId(list.id);
                          setEditingListName(list.name);
                        }}
                        title="Click to rename"
                      >
                        {list.name}
                      </span>
                    )}
                    <span style={{
                      background: 'var(--bg-hover)', borderRadius: 20,
                      padding: '2px 8px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
                    }}>
                      {list.tasks?.length ?? 0}
                    </span>
                    {list.wipLimit && (list.tasks?.length ?? 0) >= list.wipLimit && (
                      <span style={{ fontSize: 11, color: 'var(--danger)' }}>WIP limit!</span>
                    )}
                  </div>
                  <button
                    onClick={() => setAddingTaskListId(list.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, borderRadius: 6, padding: '0 4px', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >+</button>
                </div>

                {/* Add task quick form */}
                {addingTaskListId === list.id && (
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      className="input"
                      style={{ marginBottom: 8, fontSize: 13 }}
                      placeholder="Task title..."
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addTask(list.id); if (e.key === 'Escape') setAddingTaskListId(null); }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => addTask(list.id)}>Add</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAddingTaskListId(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Task cards */}
                <Droppable droppableId={String(list.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="kanban-tasks"
                      style={{
                        background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.05)' : undefined,
                        minHeight: 60,
                      }}
                    >
                      {(list.tasks ?? []).map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`task-card ${snap.isDragging ? 'task-card-dragging' : ''}`}
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              {/* Cover color */}
                              {task.coverColor && (
                                <div style={{ height: 6, borderRadius: 4, background: task.coverColor, margin: '-12px -12px 10px' }} />
                              )}

                              {/* Priority dot + title */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                                <div style={{
                                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                                  background: priorityConfig[task.priority]?.color ?? '#6b7280',
                                }} />
                                <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>{task.title}</p>
                              </div>

                              {/* Due date */}
                              {task.dueDate && (
                                <div style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
                                  color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-muted)',
                                  background: new Date(task.dueDate) < new Date() ? 'rgba(239,68,68,0.1)' : 'var(--bg-hover)',
                                  borderRadius: 4, padding: '2px 6px', marginBottom: 10,
                                }}>
                                  📅 {formatDateIndian(task.dueDate)}
                                </div>
                              )}

                              {/* Footer */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                <span className={`badge badge-priority-${task.priority}`} style={{ fontSize: 11, padding: '2px 7px' }}>
                                  {task.priority}
                                </span>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                                  {task.commentCount > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                      💬 {task.commentCount}
                                    </span>
                                  )}
                                  {task.checklistTotal > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                      ☑️ {task.checklistDone}/{task.checklistTotal}
                                    </span>
                                  )}
                                  {task.assigneeName && (
                                    <div style={{
                                      width: 24, height: 24, borderRadius: '50%',
                                      background: 'var(--accent)', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center',
                                      fontSize: 10, fontWeight: 700, color: '#fff',
                                    }}>
                                      {task.assigneeName[0]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Add List */}
            <div style={{ flexShrink: 0 }}>
              {addingList ? (
                <div style={{
                  width: 300, background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 12, padding: 16,
                }}>
                  <input
                    className="input"
                    style={{ marginBottom: 12 }}
                    placeholder="List name..."
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addList(); if (e.key === 'Escape') setAddingList(false); }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={addList}>Add List</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingList(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  style={{
                    width: 300, padding: '12px 16px', borderRadius: 12,
                    border: '2px dashed var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14,
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >
                  + Add a list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      )}

      {/* Table View */}
      {activeView === 'table' && (
        <div style={{ padding: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', 'List'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lists.flatMap(l => (l.tasks ?? []).map(t => (
                <tr key={t.id}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setSelectedTaskId(t.id)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{t.title}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-status-${t.status}`}>{t.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge badge-priority-${t.priority}`}>{t.priority}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{t.assigneeName ?? '—'}</td>
                  <td style={{ padding: '12px 16px', color: t.dueDate && new Date(t.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {t.dueDate ? formatDateIndian(t.dueDate) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                      {l.name}
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Calendar Header / Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                ◀
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCalendarDate(new Date())}>
                Today
              </button>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                ▶
              </button>
            </div>
          </div>

          {/* Grid Container */}
          <div className="card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 600 }}>
            {/* Days of week */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12, textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', gap: 8, flex: 1 }}>
              {(() => {
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();
                const totalDays = new Date(year, month + 1, 0).getDate();
                const startDayOffset = new Date(year, month, 1).getDay();
                const dayElements = [];

                // Offset days
                for (let i = 0; i < startDayOffset; i++) {
                  dayElements.push(
                    <div key={`offset-${i}`} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'rgba(22, 22, 31, 0.2)',
                      opacity: 0.3
                    }} />
                  );
                }

                // Days of month
                const allTasks = lists.flatMap(l => l.tasks ?? []);
                for (let day = 1; day <= totalDays; day++) {
                  const dayTasks = allTasks.filter(t => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
                  });

                  dayElements.push(
                    <div key={day} style={{
                      border: '1px solid var(--border)',
                      padding: '8px',
                      background: 'var(--bg-card)',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      minHeight: 100,
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{day}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', flex: 1 }}>
                        {dayTasks.map(t => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            style={{
                              background: priorityConfig[t.priority]?.color ? `${priorityConfig[t.priority].color}1c` : 'rgba(99,102,241,0.1)',
                              color: priorityConfig[t.priority]?.color ?? 'var(--accent)',
                              fontSize: 10,
                              padding: '3px 6px',
                              borderRadius: 4,
                              cursor: 'pointer',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              fontWeight: 600,
                              borderLeft: `2.5px solid ${priorityConfig[t.priority]?.color ?? 'var(--accent)'}`,
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return dayElements;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          onClose={() => { setSelectedTaskId(null); loadBoard(); }}
        />
      )}

      {/* Manage Project Members Modal */}
      {showMembers && board && (
        <div className="overlay" onClick={() => setShowMembers(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, width: 500, maxWidth: '90vw',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            color: 'var(--text-primary)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Manage Members</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              Project: <strong style={{ color: 'var(--text-primary)' }}>{board.name}</strong>
            </p>

            {/* Add Member form */}
            <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Add Member to Project
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  className="input"
                  value={selectedAddUserId || ''}
                  onChange={e => setSelectedAddUserId(Number(e.target.value) || null)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select a user...</option>
                  {allUsers
                    .filter(u => !projectMembers.some(pm => pm.userId === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.email})
                      </option>
                    ))}
                </select>
                <button
                  className="btn btn-primary"
                  disabled={!selectedAddUserId}
                  onClick={async () => {
                    if (!selectedAddUserId) return;
                    try {
                      await projectsApi.addMember(board.projectId, selectedAddUserId);
                      setSelectedAddUserId(null);
                      const res = await projectsApi.getMembers(board.projectId);
                      setProjectMembers(res.data.data ?? []);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Members List */}
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>
              Current Members ({projectMembers.length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', marginBottom: 24 }}>
              {loadingMembers ? (
                <div className="skeleton" style={{ height: 40 }} />
              ) : projectMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                  No members in this project yet.
                </p>
              ) : (
                projectMembers.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.userName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.userEmail}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await projectsApi.removeMember(board.projectId, m.userId);
                          const res = await projectsApi.getMembers(board.projectId);
                          setProjectMembers(res.data.data ?? []);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, padding: '4px 8px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowMembers(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
