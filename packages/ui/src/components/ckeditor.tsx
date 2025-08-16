"use client";

import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  Heading,
  Image,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

export interface CKEditorFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CKEditorField({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: CKEditorFieldProps) {
  return (
    <div className={className}>
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        disabled={disabled}
        config={{
          placeholder,
          licenseKey: "GPL",
          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Heading,
            List,
            Underline,
            Strikethrough,
            Link,
            BlockQuote,
            Code,
            CodeBlock,
            Image,
            ImageUpload,
            ImageToolbar,
            Table,
            TableToolbar,
          ],
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "code",
            "|",
            "link",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "insertTable",
            "imageUpload",
            "|",
            "codeBlock",
          ],
        }}
        onChange={(_event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}
