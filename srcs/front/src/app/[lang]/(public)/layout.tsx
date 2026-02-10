import AuthGuard from '../../../components/AuthGuard';
import LoginWrapper from '../../../components/LoginWrapper';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard supposelyAuth={true}>
      <LoginWrapper >
        {children}
      </LoginWrapper>
    </AuthGuard>
  );
}
