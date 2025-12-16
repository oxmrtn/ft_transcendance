import Divider from '../../components/Divider';
import Button from '../../components/Button';

export default function Login() {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div className="relative flex bg-modal-bg border border-white/10 rounded-lg">
        <div className="w-xs flex items-center justify-center">
          img
        </div>
        <div className="flex flex-col items-center gap-4 py-12 px-6">
          form
          <Divider text="Se connecter" />
          <Button text="Se connecter" primary={true} fullWidth={true} />
        </div>
      </div>
    </div>
  );
}