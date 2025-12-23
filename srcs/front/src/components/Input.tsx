'use client';

import { ChangeEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  disabled?: boolean;
  label?: string;
  type?: "email" | "text" | "password";
  value?: string;
  id?: string;
  placeholder: string;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  disabled,
  label,
  type = "text",
  value,
  id,
  placeholder,
  name,
  onChange
}: InputProps) {
  if (!placeholder)
    throw new Error("Missing placeholder prop");
  else if (!name)
    throw new Error("Missing name prop");

  const [isHidden, setHide] = useState(type === "password");

  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="text-sm font-medium text-sub-text mb-1">{label}</label>}
      <div className="w-full relative">
        <input
          disabled={disabled}
          type={isHidden && type === "password" ? "password" : "text"}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          className="w-full py-2 px-4 rounded-md text-white bg-white/5 border border-white/10 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring focus:ring-primary/50 placeholder:text-white/25 disabled:hover:cursor-default disabled:opacity-50"
        />
        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text hover:text-white hover:cursor-pointer"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setHide(h => !h)}
          >
            {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
