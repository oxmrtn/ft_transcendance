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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!isOpen)
    return null;

  return createPortal(
    (<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/5 backdrop-blur-xl">
      <div ref={modalRef}>
        {children}
      </div>
    </div>),
    document.body
  );
}
