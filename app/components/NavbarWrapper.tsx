'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Don't show navbar on root page
  if (pathname === '/') {
    return null;
  }
  
  return <Navbar />;
}

