import { Fragment, HTMLProps, ReactNode, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { VscChromeClose } from "react-icons/vsc";
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx';
interface IDrawerProps {
  closeOnOutsideClick?: boolean,
  hideHeader?: boolean,
  title?: string,
  open: boolean,
  rootCls?:string,
  handleDrawerToggle: (flag: boolean) => void,
  children: ReactNode,
  openVariant?: "left" | "right",
  panelCls?: HTMLProps<HTMLElement>["className"],
  panelInnerCls?: HTMLProps<HTMLElement>["className"],
  overLayCls?: HTMLProps<HTMLElement>["className"],
  titleCls?: HTMLProps<HTMLElement>["className"],
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
    closeIconCls,
    hideHeader = false,
    rootCls
  }: IDrawerProps
) {
  const initialFocusRef = useRef<any>(null);
  const outSideClickEvent = () => {
    if (closeOnOutsideClick) {
      handleDrawerToggle(false)
    } else {
      handleDrawerToggle(true)
    }
  }

  return (
    <Transition.Root show={open} appear={true} as={Fragment} >
      <Dialog as="div" className={twMerge("relative z-10", rootCls)} initialFocus={initialFocusRef} onClose={outSideClickEvent}>
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
              <Dialog.Panel ref={initialFocusRef} className={twMerge("absolute flex h-full w-[70%] sm:w-[50%] overflow-y-auto bg-white shadow-xl", clsx(openVariant === "left" ? 'left-0' : 'right-0'), panelCls)}>
                <div className={twMerge("flex h-full w-full gap-5 flex-col px-6 py-6", panelInnerCls)}>
                  {
                    !hideHeader && (
                      <div className={clsx("flex items-start justify-between", (!title || title.length == 0) && "flex-row-reverse")}>
                        {
                          title && (
                            <Dialog.Title className={twMerge("text-[18px] font-bold leading-6 text-gray-900", titleCls)}>
                              {
                                title
                              } 
                            </Dialog.Title>
                          )
                        }
                        <VscChromeClose className={twMerge('text-black text-[25px] cursor-pointer', closeIconCls)} onClick={() => handleDrawerToggle(false)} />
                      </div>
                    )
                  }
                  <div className="flex-1">
                    {
                      children
                    }
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}