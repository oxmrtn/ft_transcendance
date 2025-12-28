import Link from 'next/link';
import LanguageSelector from './LanguageSelector';

export default function Footer({ dictionary: dict }: { dictionary: any }) {
  if (!dict)
    throw new Error("Missing dictionnary");

  return (
    <div className="flex flex-col items-center gap-4 bg-modal-bg backdrop-blur-md w-full border-t border-white/10 px-8 py-6
    md:flex-row md:justify-between md:gap-2">
      <LanguageSelector dictionary={dict} />
      <div className="gap-2 flex flex-col
      md:gap-4 md:flex-row">
        <Link href="#" className="secondary-link">{dict.footer.privacyPolicy}</Link>
        <Link href="#" className="secondary-link">{dict.footer.termsOfService}</Link>
      </div>
    </div>
  );
}