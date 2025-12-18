import React from 'react';

interface ButtonProps {
  fullWidth?: boolean;
  primary?: boolean;
  text: string;
  onClick?: () => void;
}

export default function Button({fullWidth, primary, text, onClick}: ButtonProps) {
  if (!text)
    throw new Error("Missing text prop");

  const baseStyles = "py-2 px-4 rounded-md text-white font-bold border border-px border-white/10 transition-colors duration-200 hover:cursor-pointer";
  const widthStyles = fullWidth ? "w-full text-center" : "";
  const colorStyles = primary
    ? "bg-primary shadow-[0_0_20px] shadow-primary/70 hover:bg-primary/80"
    : "bg-white/10 hover:bg-white/20";

  const finalStyles = `${baseStyles} ${widthStyles} ${colorStyles}`;

  return (
    <button onClick={onClick} className={finalStyles}>{text}</button>
  );
}