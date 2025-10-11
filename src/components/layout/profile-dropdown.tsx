// src/components/layout/profile-dropdown.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { UserCircle, Settings, LogOut, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';

// Component to check and display admin menu
function AdminMenuCheck({ user, onClose }: { user: any, onClose: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { role } = await apiClient.get('/api/auth/check-role');
        setIsAdmin(role === 'ADMIN');
      } catch (error) {
        console.error('Error checking admin role:', error);
        // Fallback: check if user email is admin
        if (user.email === 'admin@admin.com') {
          setIsAdmin(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  if (loading || !isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
      onClick={onClose}
    >
      <Shield className="mr-2 h-4 w-4" />
      <span>Admin Panel</span>
    </Link>
  );
}

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on scroll for better UX
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    // Use a small delay to prevent immediate closing on mobile touch
    let scrollTimer: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsOpen(false);
      }, 50);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimer);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!user) return null;

  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 240; // Approximate height needed
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const margin = 16;
    
    let top: number;
    let maxHeight: number;
    
    // Check if there's enough space below
    if (spaceBelow >= dropdownHeight + margin) {
      // Open downward (preferred)
      top = rect.bottom + window.scrollY + 8;
      maxHeight = Math.min(spaceBelow - margin, 300);
    } else if (spaceAbove >= dropdownHeight + margin) {
      // Open upward
      top = rect.top + window.scrollY - dropdownHeight - 8;
      maxHeight = Math.min(spaceAbove - margin, 300);
    } else {
      // Use the space with more room
      if (spaceBelow > spaceAbove) {
        // Not much space, but use what's available below
        top = rect.bottom + window.scrollY + 8;
        maxHeight = Math.max(spaceBelow - margin, 180);
      } else {
        // Use available space above
        maxHeight = Math.max(spaceAbove - margin, 180);
        top = rect.top + window.scrollY - maxHeight - 8;
      }
    }
    
    return {
      top,
      right: window.innerWidth - rect.right,
      maxHeight,
      minHeight: Math.min(maxHeight, 180)
    };
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const dropdownContent = isOpen && mounted ? (
    <div
      ref={dropdownRef}
      className="fixed w-56 bg-white border border-gray-200 rounded-lg shadow-xl text-gray-900 overflow-y-auto"
      style={{
        ...getDropdownPosition(),
        zIndex: 9999,
        position: 'fixed',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* User Info Header */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none text-gray-900">
            {user.name || 'User'}
          </p>
          <p className="text-xs leading-none text-gray-500">
            {user.email}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <Link
          href="/profile"
          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
          onClick={handleClose}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Link>

        <Link
          href="/wishlist"
          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
          onClick={handleClose}
        >
          <Heart className="mr-2 h-4 w-4" />
          <span>Wishlist</span>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer text-gray-700"
          onClick={handleClose}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <AdminMenuCheck user={user} onClose={handleClose} />

        {/* Separator */}
        <div className="my-1 h-px bg-gray-200" />

        <button
          className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button 
        ref={buttonRef}
        variant="ghost" 
        className="relative h-8 w-8 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={''} alt={user.name || user.email || ''} />
          <AvatarFallback>
            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
      
      {mounted && typeof window !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </>
  );
}
