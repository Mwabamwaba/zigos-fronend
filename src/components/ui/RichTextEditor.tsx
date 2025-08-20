import React, { useMemo } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
  height?: string;
  simple?: boolean;
  multiline?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  readonly = false,
  height = '120px',
  simple = false,
  multiline = true
}) => {
  if (readonly) {
    return (
      <div 
        className="prose prose-sm max-w-none p-3 border border-gray-300 rounded-md bg-gray-50 text-sm leading-relaxed"
        style={{ minHeight: height }}
        dangerouslySetInnerHTML={{ __html: value || `<p class="text-gray-400 italic">${placeholder}</p>` }}
      />
    );
  }

  // For now, use a simple textarea with rich styling until we fix ReactQuill
  if (multiline) {
    return (
      <div className="w-full">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          style={{ height: height }}
          rows={4}
        />
      </div>
    );
  }

  // Single line input
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    />
  );
};

export default RichTextEditor;
