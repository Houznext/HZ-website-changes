import clsx from "clsx";
import dynamic from "next/dynamic";
import { useState } from "react";
import type ReactQuill from "react-quill";
const QuillWrapper = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // eslint-disable-next-line react/display-name
    return ({ ...props }) => <RQ {...props} />;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[84px] w-full animate-pulse rounded border border-solid border-slate-100"></div>
    ),
  }
) as typeof ReactQuill;
import "react-quill/dist/quill.snow.css";
import { twMerge } from "tailwind-merge";

export interface EditorContentChanged {
  html: string;
  markdown: string;
}

export interface RichTextEditorProps {
  type: "richtext";
  value?: any;
  name?: string;
  onChange?: (value: any) => void;
  placeholder?: string;
  label?: string;
  labelCls?: string;
  className?: string;
  required?: boolean;
  readonly?: boolean;
  rootCls?: string;
  errorMsg?: string;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "link",
    { list: "ordered" },
    { list: "bullet" },
  ],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ indent: "-1" }, { indent: "+1" }],
];

export default function RichTextEditor({
  type = "richtext",
  value = "",
  name: _name = "",
  label = "",
  labelCls = "",
  className = "",
  rootCls = "",
  required = false,
  onChange = () => {},
  readonly = false,
  placeholder = "",
   errorMsg = "",
}: RichTextEditorProps) {
  const [localTextValue, setLocalTextValue] = useState("");
  const editorOnChange = (
    content: string,
    _delta: any,
    _sources: any,
    editor: any
  ) => {
    const newTextValue = editor.getText().replaceAll("\n", "").replaceAll(" ", "");
    
    if (localTextValue !== newTextValue) {
      setLocalTextValue(newTextValue);
    }
  
    onChange(content);
  };
  
  return (
    <div className={`w-full ${rootCls}`}>
      {label && (
        <label
          className={twMerge(
            "mb-[8px] inline-block text-xs font-medium text-mine-shaft",
            labelCls
          )}
        >
          {label}
          {required &&<span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <QuillWrapper
          theme="snow"
          preserveWhitespace={true}
          readOnly={readonly}
          placeholder={placeholder ?? ""}
          modules={{
            toolbar: {
              container: TOOLBAR_OPTIONS,
            },
          }}
          className={clsx(
            {
              "flex flex-col items-stretch justify-stretch rounded-[5px] border border-solid border-[#C7C2C2] focus-within:border-transparent focus-within:ring-[2px] text-black focus-within:ring-primary":
                true,
            },
            className
          )}
          value={value ?? ""}
          onChange={editorOnChange}
        />

        {required && (
          <input
            type="text"
            required={true}
            value={localTextValue}
            onChange={() => {}}
            className="absolute inset-0 -z-[10] opacity-0"
          />
        )}
      </div>
       {!!errorMsg && (
        <p className="mt-1 text-[12px] text-red-500 font-medium">{errorMsg}</p>
      )}
    </div>
  );
}
