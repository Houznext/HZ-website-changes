import { Fragment, HTMLProps, ReactNode, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { VscChromeClose } from "react-icons/vsc";
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx';
interface IDrawerProps {
  closeOnOutsideClick?: boolean,
  hideHeader?: boolean,
  title?: string,
  open: boolean
  handleDrawerToggle: (flag: boolean) => void,
  children: ReactNode,
  openVariant?: "left" | "right",
  panelCls?: HTMLProps<HTMLElement>["className"],
  panelInnerCls?: HTMLProps<HTMLElement>["className"],
  overLayCls?: HTMLProps<HTMLElement>["className"],
  titleCls?: HTMLProps<HTMLElement>["className"],
  className?: HTMLProps<HTMLElement>["className"],
  closeIconCls?: HTMLProps<HTMLElement>["className"],
}

export default function Drawer(
  {
    closeOnOutsideClick = false,
    handleDrawerToggle,
    title,
    open,
    children,
    openVariant = "right",
    panelCls,
    panelInnerCls,
    titleCls,
    overLayCls,
    className,
    closeIconCls,
    hideHeader = false,
  }: IDrawerProps
) {
  const initialFocusRef = useRef<any>(null);
  const openedAtRef = useRef<number>(0);
  const prevOpenRef = useRef<boolean>(false);

  // Set timestamp during render when we transition to open, so it's set before the same tap hits the overlay
  if (open && !prevOpenRef.current) {
    openedAtRef.current = Date.now();
    prevOpenRef.current = true;
  }
  if (!open) prevOpenRef.current = false;

  const outSideClickEvent = () => {
    if (closeOnOutsideClick) {
      if (Date.now() - openedAtRef.current < 400) return;
      handleDrawerToggle(false);
    } else {
      handleDrawerToggle(true);
    }
  };

  const drawerContent = (
    <Transition.Root show={open} appear={true} as={Fragment} >
      <Dialog as="div" className={twMerge("relative z-50", className)} initialFocus={initialFocusRef} onClose={outSideClickEvent}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={twMerge("fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", overLayCls)} />

        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className='relative w-full h-full'>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel ref={initialFocusRef} className={twMerge("absolute flex flex-col h-full w-[70%] sm:w-[50%] bg-white shadow-xl", clsx(openVariant === "left" ? 'left-0' : 'right-0'), panelCls)}>
                {
                  !hideHeader && (
                    <div className={clsx("flex shrink-0 items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 bg-white", (!title || title.length == 0) && "flex-row-reverse")}>
                      {title && (
                        <Dialog.Title className={twMerge("text-[18px] font-bold leading-6 text-gray-900", titleCls)}>
                          {title}
                        </Dialog.Title>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDrawerToggle(false)}
                        className={twMerge("p-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer", closeIconCls)}
                        aria-label="Close"
                      >
                        <VscChromeClose className="w-6 h-6" />
                      </button>
                    </div>
                  )
                }
                <div className={twMerge("flex-1 min-h-0 flex flex-col px-6 py-4 overflow-y-auto", panelInnerCls)}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );

  return drawerContent;
}