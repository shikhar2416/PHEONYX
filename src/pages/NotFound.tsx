import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold font-heading text-white/10">404</h1>
        <h2 className="text-xl font-heading font-semibold text-white mt-2 mb-2">Page not found</h2>
        <p className="text-slate-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>
            <Home className="w-4 h-4" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
