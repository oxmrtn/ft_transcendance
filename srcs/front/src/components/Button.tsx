import React from 'react';

interface ButtonProps {
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  style?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  fullWidth,
  disabled,
  type = "button",
  style = "primary",
  children,
  onClick
}: ButtonProps) {
  if (!children)
    throw new Error("Missing children prop");

  const baseStyles = "flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white font-bold border border-px border-white/10 transition-all duration-200 hover:cursor-pointer disabled:hover:cursor-default disabled:opacity-50";
  const widthStyles = fullWidth ? "w-full text-center" : "";
  const colorStyles = style === "primary"
    ? "bg-primary shadow-[0_0_20px] shadow-primary/70 hover:bg-primary/80 disabled:hover:bg-primary"
    : "bg-white/10 hover:bg-white/20";

  const finalStyles = `${baseStyles} ${widthStyles} ${colorStyles}`;

  return (
    <button disabled={disabled} type={type} onClick={onClick} className={finalStyles}>
      {children}
    </button>
  );
}