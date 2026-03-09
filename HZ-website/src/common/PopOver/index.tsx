import { ReactNode, useRef, useState } from 'react'
import { Popover, Portal, Transition } from '@headlessui/react'
import { usePopper } from 'react-popper'

export type IPlacementTypes =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";



interface IDropDownProps {
  children: ReactNode
  placement?: IPlacementTypes;
  fallBackPlcmnts?: Array<IPlacementTypes>
  buttonElement: ReactNode,
  gapX?: number
  gapY?: number
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export function DropDown(
  props: IDropDownProps
) {
  const { children, placement = "auto", buttonElement, fallBackPlcmnts = ["auto"], gapY, gapX, setIsOpen, isOpen } = props
  const popperElRef = useRef<any>(null);
  let [referenceElement, setReferenceElement] = useState<any>(null)
  let [popperElement, setPopperElement] = useState<any>(null)
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      {
        name: "flip",
        options: {
          fallbackPlacements: fallBackPlcmnts
        },
      },
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "document",
          padding: 4,
        },
      },
      {
        name: "offset",
        options: {
          offset: [gapX, gapY]
        }
      }
    ],
  })

  return (
    <Popover as="div" className="relative" {...(isOpen !== undefined ? { open: isOpen, onClose: setIsOpen } : {})}>
      <Popover.Button as="div" ref={setReferenceElement}>{buttonElement}</Popover.Button>
      {referenceElement &&
        <Portal>
          <div
            ref={popperElRef}
            style={styles.popper}
            className="z-[999999]"
            {...attributes.popper}
          >
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
              beforeEnter={() => setPopperElement(popperElRef.current)}
              afterLeave={() => setPopperElement(null)}
            >
              {popperElement && (
                <Popover.Panel
                >
                  {
                    children
                  }
                </Popover.Panel>
              )}
            </Transition>
          </div>
        </Portal>
      }
    </Popover>
  )
}