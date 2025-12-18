import React from 'react';

interface InputProps {
  fullWidth?: boolean;
  label?: string;
  type?: "email" | "text" | "password";
  value?: string;
  id?: string;
  placeholder: string;
  name: string;
  onChange?: () => void;
}

export default function Input({
  fullWidth,
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

  const baseStyles = "py-2 px-4 rounded-md text-white bg-white/5 border border-white/10 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring focus:ring-primary/50 placeholder:text-white/25";
  const widthStyles = fullWidth ? "w-full" : "";
  const finalStyles = `${baseStyles} ${widthStyles}`;

  return (
    <div className={widthStyles}>
      {label && <label htmlFor={name} className="text-sm font-medium text-sub-text mb-1">{label}</label>}
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={finalStyles}
      />
    </div>
  );
}
