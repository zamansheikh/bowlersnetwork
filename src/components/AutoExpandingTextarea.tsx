'use client';

import { useEffect, useRef, useState } from 'react';

interface AutoExpandingTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
}

export default function AutoExpandingTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  minRows = 1,
  maxRows = 5,
  className = '',
}: AutoExpandingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    // Reset height to auto to get the correct scrollHeight
    textareaRef.current.style.height = 'auto';

    // Calculate the new height
    const scrollHeight = textareaRef.current.scrollHeight;
    const lineHeight = parseInt(
      window.getComputedStyle(textareaRef.current).lineHeight
    );
    const lines = Math.ceil(scrollHeight / lineHeight);

    // Enforce min and max rows
    const constrainedLines = Math.min(Math.max(lines, minRows), maxRows);
    const newHeight = constrainedLines * lineHeight;

    textareaRef.current.style.height = `${newHeight}px`;
  }, [value, minRows, maxRows]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`${className} resize-none`}
      style={{ overflow: 'auto' }}
    />
  );
}
