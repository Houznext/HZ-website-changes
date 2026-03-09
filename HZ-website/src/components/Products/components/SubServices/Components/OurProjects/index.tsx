import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export interface IOurProjectsProps {
  heading: string,
  projects: Array<{
    imageUrl: string,
    title: string,
    descriptionPoints: Array<string>,
    cta?: { href: string, label: string }
  }>
}

export const OurProjects = ({
  heading, projects
}: IOurProjectsProps) => {
  return (
    <div className='px-3 md:px-6'>
      <h1 className='text-center px-5 text-[20px] font-medium md:text-[24px] md:leading-[34.2px] mb-6 md:mb-16'>
        {
          heading
        }
      </h1>

      <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 justify-between gap-x-5 gap-y-10'>
        {
          projects.map((project, index) => {
            return (
              <div key={`${project.imageUrl}-${index}-${project.cta?.href}-${project.cta?.label}-${project.title}`} className='max-w-[451px] rounded-lg border border-[#DBDBDB] p-2 md:p-4'>
                <div className='relative w-full md:min-h-[259px] min-h-[130px] md:mb-6 mb-3'>
                  <Image src={project.imageUrl} alt={``} fill className='absolute' />
                </div>
                <h2 className='font-medium md:text-[20px] text-[14px] md:leading-[28.5px] mb-2 md:mb-4'>{
                  project.title
                }</h2>
                <ul>
                  {
                    project.descriptionPoints.map((desc, index) => {
                      return (
                        <li key={`disc-${desc}-${index}`} className='text-sm mb-[2px] md:text-base md:leading-[22.8px]'>
                          {
                            desc
                          }
                        </li>
                      )
                    })
                  }
                </ul>
                {
                  project.cta && (
                    <Link href={project.cta.href} className='text-[#3586FF] md:text-[16px] text-[12px] font-medium mt-7 md:mt-10 block'>
                      {
                        project.cta.label
                      }
                    </Link>
                  )
                }

              </div>
            )
          })
        }
      </div>
    </div>
  )
}
