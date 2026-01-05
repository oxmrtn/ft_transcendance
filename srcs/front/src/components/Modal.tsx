'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../contexts/ModalContext';

export default function Modal({ children }: { children: React.ReactNode }) {
  const { isOpen, closeModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen)
    return null;

  return createPortal(
    (<div>
      {children}
    </div>),
    document.body
  );
}
