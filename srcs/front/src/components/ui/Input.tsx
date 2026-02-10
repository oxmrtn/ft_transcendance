'use client';

import { ChangeEvent, useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
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

interface FileInputProps {
  disabled?: boolean;
  required?: boolean;
  value?: string;
  id: string;
  previewUrl?: string | null;
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
          customWidth || "w-full",
          "py-2 px-4 rounded-md text-white bg-white/5 border border-white/10 transition-colors duration-200 placeholder:text-muted-text",
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

function FileInput({
  disabled,
  value,
  id,
  previewUrl,
  onChange
}: FileInputProps) {
  if (!id)
    throw new Error("Missing id prop");

  return (
    <>
      <label
        htmlFor={id}
        className={`h-20 w-20 rounded-full flex items-center justify-center overflow-hidden text-sub-text bg-white/5 border border-white/10 transition-colors duration-200 cursor-pointer
        hover:bg-white/10 hover:text-white
        ${disabled ? 'opacity-50 cursor-default' : ''}`}
      >
        {previewUrl ? (
          <img src={previewUrl} className="w-full h-full object-cover" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </label>
      <input
        disabled={disabled}
        type="file"
        id={id}
        name={`${id}-name`}
        value={value}
        onChange={onChange}
        accept="image/png, image/jpeg"
        className="hidden"
      />
    </>
  );
}

export {
  TextInput,
  FileInput
}