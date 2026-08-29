"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { useEffect, useState, useRef, memo } from "react";
import {
  Image as ImageIcon,
  Table as TableIcon,
  X,
  Plus,
  Trash2,
  Combine,
  Split,
  List,
  ListOrdered,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

type Props = {
  content: string;
  onChange: (html: string) => void;
  token?: string;
};

const ArticleEditor = memo(function ArticleEditor({
  content,
  onChange,
  token,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  // Table modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);

  const lastEmittedHtmlRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: "editor-content min-h-[250px] focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== lastEmittedHtmlRef.current) {
      if (content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
      lastEmittedHtmlRef.current = content;
    }
  }, [content, editor]);

  if (!editor) return null;

  const headingLevels: (2 | 3)[] = [2, 3];

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl.trim(), alt: altText.trim() })
      .run();
    setImageUrl("");
    setAltText("");
    setIsModalOpen(false);
  };

  const handleInsertTable = () => {
    const rows = Math.max(1, Math.min(20, tableRows || 3));
    const cols = Math.max(1, Math.min(10, tableCols || 3));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    setIsTableModalOpen(false);
  };

  const isTableActive = editor.isActive("table");

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50 rounded-t-lg items-center">
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
          عريض
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive("italic"))}>
          مائل
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarBtn(editor.isActive("strike"))}>
          مشطوب
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarBtn(editor.isActive("bulletList"))} flex items-center gap-1.5`}
          title="قائمة نقطية (ul)">
          <List className="w-4 h-4" />
          <span>قائمة نقطية</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarBtn(editor.isActive("orderedList"))} flex items-center gap-1.5`}
          title="قائمة رقمية (ol)">
          <ListOrdered className="w-4 h-4" />
          <span>قائمة رقمية</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt("أدخل الرابط");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={toolbarBtn(editor.isActive("link"))}>
          رابط
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${toolbarBtn(false)} flex items-center gap-1.5 bg-[#6B4E2F]/10 text-[#6B4E2F] border-[#6B4E2F]/30 hover:bg-[#6B4E2F]/20`}
          title="إدراج صورة داخل المقال">
          <ImageIcon className="w-4 h-4" />
          <span>إضافة صورة</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTableModalOpen(true)}
          className={`${toolbarBtn(isTableActive)} flex items-center gap-1.5 bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100`}
          title="إدراج جدول داخل المقال">
          <TableIcon className="w-4 h-4" />
          <span>إضافة جدول</span>
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className={toolbarBtn(false)}>
          مسح
        </button>
      </div>

      {/* Contextual Table Controls Toolbar */}
      {isTableActive && (
        <div className="flex flex-wrap gap-1.5 border-b p-2 bg-blue-50/60 rounded-none items-center text-xs text-blue-900 animate-in fade-in duration-150">
          <span className="font-semibold ml-1 flex items-center gap-1 text-blue-950">
            <TableIcon className="w-3.5 h-3.5" />
            تحرير الجدول:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="إضافة صف للأعلى">
            <Plus className="w-3 h-3 text-blue-600" />
            صف للأعلى
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="إضافة صف للأسفل">
            <Plus className="w-3 h-3 text-blue-600" />
            صف للأسفل
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="حذف الصف الحالي">
            <Trash2 className="w-3 h-3 text-red-600" />
            حذف صف
          </button>
          <div className="w-[1px] h-4 bg-blue-200 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="إضافة عمود لليمين">
            <Plus className="w-3 h-3 text-blue-600" />
            عمود لليمين
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="إضافة عمود لليسار">
            <Plus className="w-3 h-3 text-blue-600" />
            عمود لليسار
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="حذف العمود الحالي">
            <Trash2 className="w-3 h-3 text-red-600" />
            حذف عمود
          </button>
          <div className="w-[1px] h-4 bg-blue-200 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
            className="px-2 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="دمج أو تقسيم الخلايا">
            <Combine className="w-3 h-3 text-blue-600" />
            دمج / تقسيم
          </button>
          <div className="w-[1px] h-4 bg-blue-200 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-xs flex items-center gap-1 shadow-xs transition-colors"
            title="حذف الجدول بالكامل">
            <Trash2 className="w-3 h-3" />
            حذف الجدول
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="p-4 prose prose-lg max-w-full focus:outline-none min-h-[250px]"
      />

      {/* Insert Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#332822] flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#6B4E2F]" />
                إدراج صورة في المقال
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setImageUrl("");
                  setAltText("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                token={token}
                label="اختر صورة من جهازك أو أدخل رابطاً"
                placeholder="انقر لااختيار صورة للمقال"
              />

              <div>
                <label className="block text-xs font-medium text-[#8B7D72] mb-1">
                  نص بديل للصورة (Alt Text - اختياري)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="وصف مختصر للصورة لـ SEO"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#6B4E2F]/40"
                  dir="auto"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setImageUrl("");
                  setAltText("");
                }}
                className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="px-4 py-2 bg-[#6B4E2F] text-white rounded-md text-xs font-medium hover:bg-[#5a3f25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                إدراج الصورة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#332822] flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-blue-600" />
                إدراج جدول جديد
              </h3>
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B7D72] mb-1">
                    عدد الصفوف
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) =>
                      setTableRows(parseInt(e.target.value) || 1)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8B7D72] mb-1">
                    عدد الأعمدة
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) =>
                      setTableCols(parseInt(e.target.value) || 1)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="withHeaderRow"
                  checked={withHeaderRow}
                  onChange={(e) => setWithHeaderRow(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="withHeaderRow"
                  className="text-xs font-medium text-[#332822] cursor-pointer">
                  تضمين صف رأس للجدول (Header Row)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="px-4 py-2 border rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs">
                إدراج الجدول
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ArticleEditor;

function toolbarBtn(active: boolean) {
  return `px-3 py-1 rounded-md border text-sm font-medium transition-colors
    ${active ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`;
}
