'use client';

import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, Code, RotateCcw } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write something...', readOnly = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, arg: string = '') => {
    if (readOnly) return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '8px',
      background: readOnly ? 'var(--bg-secondary)' : 'var(--bg-primary)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        .rte-content:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          display: block;
        }
        .rte-content pre {
          background: var(--bg-secondary);
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
        }
        .rte-content ul {
          padding-left: 20px;
          list-style-type: disc;
        }
        .rte-content ol {
          padding-left: 20px;
          list-style-type: decimal;
        }
        .rte-btn {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .rte-btn:hover {
          background: var(--border) !important;
          color: var(--text-primary) !important;
        }
      `}</style>

      {!readOnly && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexWrap: 'wrap',
        }}>
          <button type="button" onClick={() => execCommand('bold')} className="rte-btn" title="Bold"><Bold size={16} /></button>
          <button type="button" onClick={() => execCommand('italic')} className="rte-btn" title="Italic"><Italic size={16} /></button>
          <button type="button" onClick={() => execCommand('underline')} className="rte-btn" title="Underline"><Underline size={16} /></button>
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
          <button type="button" onClick={() => execCommand('insertUnorderedList')} className="rte-btn" title="Bullet List"><List size={16} /></button>
          <button type="button" onClick={() => execCommand('formatBlock', '<pre>')} className="rte-btn" title="Code Block"><Code size={16} /></button>
          <button type="button" onClick={() => execCommand('removeFormat')} className="rte-btn" title="Clear Formatting"><RotateCcw size={16} /></button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className="rte-content"
        style={{
          padding: '12px 16px',
          minHeight: '100px',
          outline: 'none',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          cursor: readOnly ? 'default' : 'text',
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
