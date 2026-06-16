import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function DashboardPage() {
    const session = await auth();

    // If not authenticated, redirect to login
    if (!session?.user) {
        redirect('/login');
    }

    // Redirect based on user role
    const role = session.user.role;

    if (role === 'admin') {
        redirect('/dashboard/admin');
    } else if (role === 'client') {
        redirect('/dashboard/client/my-project');
    }

    // Fallback for unknown roles
    redirect('/');
}
