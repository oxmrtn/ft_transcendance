import LanguageSelector from './LanguageSelector';

export default function Footer({ dictionary: dict }: { dictionary: any }) {
  if (!dict)
    throw new Error("Missing dictionnary");

  return (
    <div className="flex bg-modal-bg backdrop-blur-md w-full h-24 border-t border-white/10 items-center px-8">
      <LanguageSelector dictionary={dict} />
    </div>
  );
}