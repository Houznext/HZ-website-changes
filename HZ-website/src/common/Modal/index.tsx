import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import Button from '../Button';

const Modal = ({ isOpen, closeModal, title, titleCls, children, className, isCloseRequired = false, closeIcon = true, rootCls, innerCls }: any) => {

  return (
    <Transition appear show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" className={twMerge('relative z-[100]', rootCls)} onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-35" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className={twMerge('flex min-h-full items-center justify-center p-4 text-center', innerCls)}>
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
                {closeIcon && (
                  <>
                    <Button
                      onClick={() => {
                        console.log("Close icon clicked");
                        closeModal();
                      }}
                      className="absolute top-4 bg-blue-200 z-[100000] hover:bg-blue-400 right-4 rounded-md text-gray-500  font-medium hover:text-gray-800 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </>
                )}
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
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-400 md:px-6 md:py-3 px-2 py-1 text-sm md:text-[16px] font-medium text-white hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3586FF] focus-visible:ring-offset-2"
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
