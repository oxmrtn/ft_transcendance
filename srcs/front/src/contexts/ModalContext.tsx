'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from '../components/Modal';

export type ModalVariant = 'default' | 'chat';

interface ModalOptions {
  variant?: ModalVariant;
  preventClose?: boolean;
}

interface ModalContextType {
  isOpen: boolean;
  modalOptions: ModalOptions;
  openModal: (content: ReactNode, modalOptions?: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalOptions, setOptions] = useState<ModalOptions>({ variant: 'default', preventClose: false });

  const openModal = (content: ReactNode, modalOptions?: ModalOptions) => {
    setModalContent(content);
    setOptions(modalOptions || { variant: 'default', preventClose: false });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalContent(null);
      setOptions({ variant: 'default', preventClose: false });
    }, 300); 
  };

  return (
    <ModalContext.Provider value={{ isOpen, modalOptions, openModal, closeModal }}>
      {children}
      <Modal>
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
};

function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

export {
  ModalProvider,
  useModal
}
