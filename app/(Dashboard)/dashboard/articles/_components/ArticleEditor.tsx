"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

type Props = {
  content: string;
  onChange: (html: string) => void;
};

export default function ArticleEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content,
    editorProps: {
      attributes: {
        class: "editor-content min-h-[200px] focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const headingLevels: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <div className="border rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50 rounded-t-lg">
        {headingLevels.map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: lvl }).run()
            }
            className={toolbarBtn(editor.isActive("heading", { level: lvl }))}>
            عنوان {lvl}
          </button>
        ))}

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive("bold"))}>
          عريض {/* Bold */}
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive("italic"))}>
          مائل {/* Italic */}
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarBtn(editor.isActive("strike"))}>
          مشطوب {/* Strike */}
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt("أدخل الرابط"); // "Enter link"
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={toolbarBtn(editor.isActive("link"))}>
          رابط {/* Link */}
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className={toolbarBtn(false)}>
          مسح {/* Clear */}
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="p-4 prose prose-lg max-w-full focus:outline-none"
      />
    </div>
  );
}

function toolbarBtn(active: boolean) {
  return `px-3 py-1 rounded-md border text-sm font-medium transition-colors
    ${active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`;
}
