'use client';

import { ChangeEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TextInputProps {
  customWidth?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  type?: "email" | "text" | "password";
  value?: string;
  id: string;
  placeholder: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

function TextInput({
  customWidth,
  disabled,
  required,
  label,
  type = "text",
  value,
  id,
  placeholder,
  onChange
}: TextInputProps) {
  if (!placeholder)
    throw new Error("Missing placeholder prop");
  else if (!id)
    throw new Error("Missing id prop");

  const [isHidden, setHide] = useState(type === "password");

  return (
    <>
      {label && <label htmlFor={id} className="text-sm font-medium text-sub-text mb-1">{label}</label>}
      <div className={cn(
        customWidth || "w-full",
        "relative"
      )}>
        <input
          disabled={disabled}
          required={required}
          type={type === "password" ? (isHidden ? "password" : "text") : type}
          name={`${id}-name`}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          className={cn(
          customWidth && `${customWidth} py-1 px-3`,
          !customWidth && "w-full py-2 px-4",
          "rounded-md text-white bg-white/5 border border-white/10 transition-colors duration-200 placeholder:text-muted-text",
          "hover:bg-white/10",
          "focus:outline-none focus:ring focus:ring-primary/50",
          "disabled:opacity-20 disabled:cursor-default"
        )}/>
        {type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sub-text cursor-pointer
              hover:text-white"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setHide(h => !h)}
          >
            {isHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </>
  );
}

export { TextInput };