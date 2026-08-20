'use client';

import { useEffect, useState } from 'react';
import { projectsApi, customFieldsApi } from '@/lib/api';
import { showToast, ConfirmModal } from '@/components/shared/ToastProvider';

interface Workspace {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  color: string;
}

interface CustomFieldDefinition {
  id?: number;
  projectId: number;
  name: string;
  fieldType: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: string | null;
  defaultValue?: string | null;
  isRequired: boolean;
  position: number;
}

export default function CustomFieldsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [definitions, setDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'date' | 'boolean'>('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldDefault, setFieldDefault] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setLoadingWorkspaces(false);
    projectsApi.getAll()
      .then(res => setProjects(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setLoading(true);
      projectsApi.getAll(selectedWorkspaceId)
        .then(res => {
          const list = res.data.data || [];
          setProjects(list);
          if (list.length > 0) {
            setSelectedProjectId(list[0].id);
          } else {
            setSelectedProjectId(null);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (selectedProjectId) {
      setFieldsLoading(true);
      customFieldsApi.getDefinitions(selectedProjectId)
        .then(res => {
          setDefinitions(res.data.data || []);
          setFieldsLoading(false);
        })
        .catch(() => setFieldsLoading(false));
    }
  }, [selectedProjectId]);

  const openCreateModal = () => {
    setEditingField(null);
    setFieldName('');
    setFieldType('text');
    setFieldOptions('');
    setFieldDefault('');
    setFieldRequired(false);
    setModalOpen(true);
  };

  const openEditModal = (def: CustomFieldDefinition) => {
    setEditingField(def);
    setFieldName(def.name);
    setFieldType(def.fieldType);
    setFieldOptions(def.options || '');
    setFieldDefault(def.defaultValue || '');
    setFieldRequired(def.isRequired);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const payload: CustomFieldDefinition = {
      projectId: selectedProjectId,
      name: fieldName,
      fieldType,
      options: fieldType === 'select' ? fieldOptions : null,
      defaultValue: fieldDefault || null,
      isRequired: fieldRequired,
      position: editingField?.position ?? definitions.length
    };

    try {
      if (editingField?.id) {
        await customFieldsApi.updateDefinition(editingField.id, payload);
      } else {
        await customFieldsApi.createDefinition(payload);
      }
      
      // Reload definitions
      const res = await customFieldsApi.getDefinitions(selectedProjectId);
      setDefinitions(res.data.data || []);
      setModalOpen(false);
    } catch (err) {
      showToast.error('Error saving custom field definition');
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedProjectId) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Custom Field?',
      message: 'Are you sure you want to delete this custom field? Existing values on tasks will be hidden.',
      onConfirm: async () => {
        try {
          await customFieldsApi.deleteDefinition(id);
          setDefinitions(prev => prev.filter(d => d.id !== id));
          showToast.success('Custom field deleted.');
        } catch {
          showToast.error('Error deleting custom field definition');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (loadingWorkspaces) {
    return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Loading workspaces...</div>;
  }

  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 1000, margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Custom Fields Manager</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Extend your task details page with custom data fields tailored to your work context.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span>＋</span> Add Custom Field
        </button>
      </div>

      {/* Workspace & Project selector */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Workspace:</span>
          <select
            className="input"
            value={selectedWorkspaceId || ''}
            onChange={e => setSelectedWorkspaceId(Number(e.target.value))}
            style={{ width: 220, background: 'var(--bg-primary)' }}
          >
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                💼 {w.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Project:</span>
          {loading ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading projects...</span>
          ) : (
            <select
              className="input"
              value={selectedProjectId || ''}
              onChange={e => setSelectedProjectId(Number(e.target.value))}
              style={{ width: 220, background: 'var(--bg-primary)' }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {fieldsLoading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading fields...</div>
      ) : definitions.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 28, marginBottom: 12 }}>🔧</p>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No Custom Fields Defined</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Create fields like "Story Points", "QA Status", or "Launch Date" for this project.
          </p>
          <button onClick={openCreateModal} className="btn btn-secondary btn-sm">
            Create First Field
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {definitions.map(def => (
            <div key={def.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{def.name}</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                    background: 'var(--bg-hover)', color: 'var(--accent)', textTransform: 'uppercase'
                  }}>
                    {def.fieldType}
                  </span>
                  {def.isRequired && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444', textTransform: 'uppercase', marginLeft: 6
                    }}>
                      Required
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEditModal(def)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
                    title="Edit Field"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => def.id && handleDelete(def.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14 }}
                    title="Delete Field"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {def.fieldType === 'select' && def.options && (
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Options:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {def.options.split(',').map((opt, i) => (
                      <span key={i} style={{ fontSize: 11, background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4 }}>
                        {opt.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {def.defaultValue && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600 }}>Default: </span>
                  <code style={{ background: 'var(--bg-hover)', padding: '2px 4px', borderRadius: 4 }}>
                    {def.defaultValue}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 460, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Field Name
                </label>
                <input
                  required
                  className="input"
                  value={fieldName}
                  onChange={e => setFieldName(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                  placeholder="e.g. Story Points, QA Status"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Field Type
                </label>
                <select
                  disabled={!!editingField}
                  className="input"
                  value={fieldType}
                  onChange={e => setFieldType(e.target.value as any)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                >
                  <option value="text">Short Text</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown List</option>
                  <option value="date">Date</option>
                  <option value="boolean">Checkbox / Toggle</option>
                </select>
              </div>

              {fieldType === 'select' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Options (comma-separated list)
                  </label>
                  <input
                    required
                    className="input"
                    value={fieldOptions}
                    onChange={e => setFieldOptions(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-primary)' }}
                    placeholder="e.g. Planning, Ready, Completed"
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Default Value (optional)
                </label>
                <input
                  className="input"
                  value={fieldDefault}
                  onChange={e => setFieldDefault(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-primary)' }}
                  placeholder="e.g. 5, Pending"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="required-checkbox"
                  checked={fieldRequired}
                  onChange={e => setFieldRequired(e.target.checked)}
                />
                <label htmlFor="required-checkbox" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Require this field to be populated on all tasks
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
