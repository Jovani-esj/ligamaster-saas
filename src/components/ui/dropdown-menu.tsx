'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function DropdownMenu({ trigger, children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
          className
        )}>
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, href, className, icon }: DropdownMenuItemProps) {
  const baseClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors";
  const classes = cn(baseClasses, className);

  if (href) {
    return (
      <a href={href} className={classes}>
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          {children}
        </div>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      <div className="flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </div>
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <hr className="my-1 border-gray-200" />;
}
