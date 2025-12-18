import Divider from '../../components/Divider';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center px-8">
      <div className="flex bg-modal-bg border border-white/10 rounded-xl overflow-hidden">
        <div className="w-2xs flex items-center justify-center border border-white/10 rounded-xl noise-mesh-bg -m-px">
        </div>
        <div className="w-md relative flex flex-col items-center gap-4 py-12 px-8">
          <div className="grid-gradient"></div>
          <h1 className="text-xl font-semibold">VersuS Code</h1>
          <Divider text="Se connecter" />
          <div className="w-full flex flex-col gap-2">
            <Input fullWidth={true} placeholder="E-mail" name="email" type="email" />
            <Input fullWidth={true} placeholder="Mot de passe" name="password" type="password" />
          </div>
          <div className="w-full flex items-center flex-col gap-2">
            <Button text="Se connecter" fullWidth={true} primary={true} />
            <Link href="#" className="primary-link">Mot de passe oublié</Link>
          </div>
          <Divider />
          <div className="flex gap-1">
            <p className="text-sub-text">Pas de compte ?</p>
            <Link href="#" className="primary-link">S'inscrire</Link>
          </div>
        </div>
      </div>
    </div>
  );
}