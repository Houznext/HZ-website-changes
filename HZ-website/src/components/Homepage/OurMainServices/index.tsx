import PropertyHeader from '@/components/PropertiesListComponent/PropertyHeader'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LiaLongArrowAltRightSolid } from 'react-icons/lia'
interface IOurMainServicesProps {
  heading: string
  tabs: Array<{
    tabKey: string,
    buttonLabel: string,
    selectedIconUrl: string
    normalIconUrl: string
  }>
  tabPanels: Array<{
    tabKey: string,
    content: string,
    description1: string,
    description2: string
    specialWord: string,
    imageUrl: string,
    showMore: { label: string, href: string }
  }>
}
export const OurMainServices = ({ heading, tabs, tabPanels }: IOurMainServicesProps) => {
  return (
    <div>
      <p style={{ backgroundImage: "linear-gradient(90deg, #3586FF 30.48%, #212227 100%)", color: "transparent", backgroundClip: "text" }} className='text-[31px] leading-[44.17px] font-medium text-center mb-[35px] md:mb-[48px]'>
        {heading}
      </p>
      <Tab.Group>
        <Tab.List className={`flex w-full md:justify-center md:items-center overflow-auto gap-[16px] md:gap-[40px] mb-[40px] md:mb-[120px] px-2`}>
          {
            tabs.map((tabList) => {
              return (
                <Tab key={`${tabList.tabKey}`}

                  className={({ selected }) =>
                    clsx({
                      "md:text-base text-sm w-fit rounded-lg px-[16px] py-[10px] flex items-center justify-center gap-1 border": true,
                      "font-medium bg-[#FFFFFF] text-[#212227]": !selected,
                      "font-medium bg-[#3586FF] text-[#FDFDFD] focus:outline-none": selected
                    })}
                >
                  {
                    <Image src={tabList.normalIconUrl} alt="" width={20} height={20} />
                  }
                  <span className='text-nowrap md:text-wrap'>{tabList.buttonLabel}</span>
                </Tab>
              )
            })
          }
        </Tab.List>
        <Tab.Panels className={`px-[24px]`}>
          {
            tabPanels.map((panel) => {
              return (
                <Tab.Panel key={`${panel.tabKey}`} className={`grid grid-cols-1 lg:grid-cols-2 gap-[20px]`}>
                  <div className='max-w-[600px]'>
                    <p className='text-[39px] leading-[55.57px] mb-[30px]'><span>{panel.description1}</span><span className='font-bold text-[#3586FF]'>{panel.specialWord}</span><span>{panel.description2}</span></p>
                    <p className='leading-[22.8px] text-[#6C727F] font-medium mb-5'>{panel.content}</p>
                    <Link href={panel.showMore.href} className={"flex items-center gap-2"}>
                      <span className='text-[#3586FF] font-medium leading-[22.8px]'>{panel.showMore.label}</span>
                      {/* <LiaLongArrowAltRightSolid className='text-[#3586FF] leading-tight' /> */}
                    </Link>
                  </div>
                  <div>
                    <div className='h-[200px] lg:h-[269px] relative rounded-md'>
                      <Image src={panel.imageUrl} alt="" className='absolute' fill />
                    </div>
                  </div>
                </Tab.Panel>
              )
            })
          }
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

// border: 2px solid #0E08540A