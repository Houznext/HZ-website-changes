import React, { forwardRef, isValidElement, ReactNode, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import CustomInput, { ICustomInputProps } from './CustomInput'
import SingleSelect, { ISingleSelectProps } from './SingleSelect'
import MultiSelect, { IMultiSelectProps } from './MultiSelect'
import CheckboxInput, { CheckboxInputProps } from './CheckBoxInput'
import RichTextEditor, { RichTextEditorProps } from './RichTextEditor'
import FileInput, { FileInputProps } from '../FileInput'
import ImageUploader, { ImageUploaderProps } from './DragImageInput'

export interface CustomFormOtherProps {
  rootCls?: string,
  heading?: ReactNode,
  headingCls?: string,
  subHeading?: ReactNode,
  subHeadingCls?: string,
  inputCls?: string,
  topHeader?: ReactNode,
  footer?: ReactNode,
  inputArr?: Array<ICustomInputProps | ISingleSelectProps | IMultiSelectProps | CheckboxInputProps | RichTextEditorProps | FileInputProps  | ImageUploaderProps>
  btns?: Array<any>
  btnsCls?: string
}

export type CustomFormRef = HTMLFormElement;

export type CustomFormAttributes = React.InputHTMLAttributes<HTMLFormElement>;

export type ICustomFormProps = React.DetailedHTMLProps<
  CustomFormAttributes,
  CustomFormRef
> &
  CustomFormOtherProps

const CustomForm = forwardRef<CustomFormRef, ICustomFormProps>(function CustomForm(props, ref) {
  const { rootCls, heading, headingCls, subHeading, subHeadingCls, inputCls, btnsCls, inputArr, topHeader, footer, btns, ...otherFormProps } = props

  const renderComponent = (element: any, key: string) => {
    if (element && element.type) {
      switch (element.type) {
        case "single-select": {
          const props = element as ISingleSelectProps;
          return <SingleSelect key={key} {...props} />;
        }
        case "multi-select": {
          const props = element as IMultiSelectProps;
          return <MultiSelect key={key} {...props} />;
        }
        case "checkbox": {
          const { ref, ...otherCheckBoxProps } = element as CheckboxInputProps;
          return <CheckboxInput {...otherCheckBoxProps} />;
        }
        case "richtext": {
          const props = element as RichTextEditorProps;
          return <RichTextEditor {...props} />;
        }
        case "file": {
          const props = element as FileInputProps;
          return <FileInput {...props} />;
        }
        case "images": {
          const props = element as ImageUploaderProps;
          return <ImageUploader {...props} />;
        }
        default: {
          if (
            element.type == "text" ||
            element.type == "textarea" ||
            element.type == "number" ||
            element.type == "url" ||
            element.type == "email" ||
            element.type == "password"
          ) {
            const { ref, ...otherProps } = element as ICustomInputProps;
            return <CustomInput key={key} {...otherProps} />;
          } else {
            return null;
          }
        }
      }
    } else {
      return null
    }
  }

  return (
    <div className={twMerge("w-full", rootCls)}>
      <form ref={ref} {...otherFormProps}>
        {
          topHeader
        }
        {
          heading ? typeof heading === "string" ? heading.trim().length > 0 ? <p className={twMerge("text-lg w-full font-bold mb-7", headingCls)}>{heading}</p> : null : isValidElement(heading) ? <div className={twMerge("mb-7", headingCls)}>{heading}</div> : null : null
        }
        {
          subHeading ? typeof subHeading === "string" ? subHeading.trim().length > 0 ? <p className={twMerge("text-sm w-full font-medium mb-4", subHeadingCls)}>{subHeading}</p> : null : isValidElement(subHeading) ? <div className={twMerge("", subHeadingCls)}>{subHeading}</div> : null : null
        }
        {inputArr && inputArr.length > 0 ? (
          <div className={twMerge("w-full grid grid-cols-1 gap-y-5 gap-x-5", inputCls)}>
            {
              inputArr.map((element, index) => {
                return (renderComponent(element, `element-${index}-${element.type}`))
              })
            }
          </div>) : null
        }
        {
          btns ? (
            <div className={twMerge('flex w-full col-span-full items-center justify-between gap-5 flex-wrap', btnsCls)}>
              {
                btns.map((button, index) => {
                  return (
                    <React.Fragment key={`form-buttons-${index}`}>
                      <>
                        {
                          button
                        }
                      </>
                    </React.Fragment>
                  )
                })
              }
            </div>) : null
        }
        {
          footer
        }
      </form>
    </div>
  )
})

export default CustomForm