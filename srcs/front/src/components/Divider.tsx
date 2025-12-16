import React from 'react';

interface DividerProps {
  justify?: boolean;
  text?: string;
}

export default function Divider({ justify, text }: DividerProps) {
  return (
    <div className="flex w-full gap-1 items-center">
      {text && text.trim() !== '' && (
        <>
          {!justify && <div className="flex-1 h-px bg-white/50"></div>}
          <span className="text-white/50">{text}</span>
        </>
      )}
      <div className="flex-1 h-px bg-white/50"></div>
    </div>
  );
}