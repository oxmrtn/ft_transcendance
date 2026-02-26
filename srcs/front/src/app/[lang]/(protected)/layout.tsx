import AuthGuard from '../../../components/AuthGuard';
import Chat from '../../../components/Chat';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    );
}
