import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return <Link to="/" aria-label="OFFLINE MIND home" data-testid="link-logo" className={`inline-flex items-center ${className}`}>
    <img src="/Brand/offline-mind-black.svg" alt="OFFLINE MIND" className="block w-[130px] h-auto object-contain" />
  </Link>;
}