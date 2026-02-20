import React from 'react';

interface ButtonProps {
  fullWidth?: boolean;
  rounded?: boolean
  disabled?: boolean;
  type?: "button" | "submit";
  variant: "primary" | "secondary" | "ghost" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  fullWidth,
  rounded,
  disabled,
  type = "button",
  variant,
  children,
  onClick
}: ButtonProps) {
  if (!children)
    throw new Error("Missing children prop");

  if (type === "button" && !onClick)
    throw new Error("Missing onClick prop");

  if (!variant)
    throw new Error("Missing variant prop");

  const baseStyles = `flex items-center justify-center gap-2 text-white font-bold border border-px transition-all duration-200 cursor-pointer uppercase font-mono
    disabled:opacity-20 disabled:cursor-default`;

  const colorStyles =
    variant === 'primary'
      ? 'bg-primary border-white/10 shadow-[0_0_20px] shadow-primary/70 hover:bg-primary/80 disabled:hover:bg-primary'
      : variant === 'secondary'
      ? 'bg-white/10 border-white/10 hover:bg-white/20 disabled:hover:bg-white/10'
      : variant === 'danger'
      ? 'bg-destructive/20 border-destructive/20 hover:bg-destructive/30 disabled:hover:bg-destructive/20'
      : 'bg-white/0 border-white hover:bg-white/10 disabled:hover:bg-white/0';

  const widthStyles = fullWidth ? "w-full text-center py-2 px-4" : "py-1 px-3";
  const roundedStyles = rounded ? "rounded-full" : "rounded-md";

  const finalStyles = `${baseStyles} ${colorStyles} ${widthStyles} ${roundedStyles}`;

  return (
    <button disabled={disabled} type={type} onClick={onClick} className={finalStyles}>
      {children}
    </button>
  );
}
