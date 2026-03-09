import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'


export interface IMultiSelectProps {
  type: "multi-select"
  name: string
  label?: string
  labelCls?: string,
  errorMsg?: string,
  errorCls?: string,
  note?: String,
  noteCls?: String,
  buttonCls?: string,
  optionCls?: string,
  selectedOptionCls?: string,
  openButtonCls?: string
  id?: string
  optionsInterface: { isObj: boolean, displayKey?: string }
  options: Array<any>
  selectedOptions: Array<any>
  handleChange?: (name: string, value: any) => void
}


export default function MultiSelect(props: IMultiSelectProps) {
  const { name, type, optionsInterface, options, selectedOptions, handleChange, label, labelCls, id, openButtonCls, buttonCls, errorCls, errorMsg, note, noteCls, optionCls, selectedOptionCls } = props
  return (
    <Listbox value={selectedOptions} onChange={(value) => { handleChange && handleChange(name, value) }} multiple>
      {({ open }) => (
        <div className="relative">
          {(label && label.trim().length > 0) && <Listbox.Label htmlFor={id} className={twMerge(clsx({
            "mb-2 inline-block text-xs font-medium text-[#333333]": true,
            "cursor-pointer": id
          }), labelCls)}>{label}</Listbox.Label>}
          <Listbox.Button as={`div`} className={twMerge(
            clsx({
              "relative min-h-[33px] md:min-h-[38px] w-full flex flex-wrap cursor border rounded-[6px] border-[#C7C2C2] py-2 pl-3 pr-10 text-left focus:outline-none text-[13px] cursor-pointer": true,
              "border-blue-400": open,
            }), buttonCls,
            clsx({
              [String(openButtonCls)]: open && !!openButtonCls && openButtonCls.trim().length > 0
            })
          )}>
            {
              selectedOptions?.length > 0 && selectedOptions.map((selectedOption) => {
                return (
                  optionsInterface.isObj ? optionsInterface.displayKey ? selectedOption[optionsInterface.displayKey] ?? "" : "" : selectedOption
                )
              }).join(", ")
            }
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {options.map((optn, optnIdx) => (
                <Listbox.Option
                  key={`multiselect-${optnIdx}`}
                  className={
                    twMerge(clsx({
                      "w-full": true
                    }))
                  }
                  value={optn}
                >
                  {({ selected }) => (
                    <div className={twMerge(
                      clsx({
                        "px-3 py-2 mb-1 hover:bg-[#3B81F6] hover:text-white cursor-pointer": true,
                        "text-gray-800 bg-white": !selected,
                        "text-white bg-gray-700": selected,
                      },
                      ),
                      optionCls,
                      clsx({
                        [String(selectedOptionCls)]: selected && !!selectedOptionCls && selectedOptionCls.trim().length > 0
                      })
                    )}>
                      {
                        optionsInterface.isObj ? optionsInterface.displayKey ? optn[optionsInterface.displayKey] ?? "" : "" : optn
                      }

                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
          {
            note && note.trim().length > 0 && (
              <p className={twMerge(clsx({ "text-right text-[9px] mb-1 text-gray-700": true }, noteCls))}>{note}</p>
            )
          }
          {
            errorMsg && errorMsg.trim().length > 0 && (
              <p className={twMerge(clsx({ "text-red-400 text-xs mt-1 font-regular ": true }), errorCls)}>{errorMsg}</p>
            )
          }
        </div>
      )}
    </Listbox>
  )
}