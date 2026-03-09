import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import Button from '../Button';
import { int } from 'aws-sdk/clients/datapipeline';

interface ModalProps {
  isOpen?: boolean;
  closeModal?: () => void;
  title?: string;
  titleCls?: string;
  children?: React.ReactNode;
  className?: string;
  isCloseRequired?: boolean;
  rootCls?: string;
}

const Modal = ({ isOpen, closeModal, title, titleCls, children, className, isCloseRequired = true, rootCls }: ModalProps) => {

  return (
    <Transition appear show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" static className={twMerge('relative z-[100]', rootCls)} onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center md:p-4 p-2 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={twMerge(
                  'w-full max-w-[1000px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all',
                  className
                )}
              >
                <Dialog.Title
                  as="h3"
                  className={twMerge('text-lg font-medium text-gray-900', titleCls)}
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">{children}</div>
                {
                  isCloseRequired && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-50 px-4 py-1 text-[12px] md:text-[14px] font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5297ff]focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        Close
                      </Button>
                    </div>
                  )
                }
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
