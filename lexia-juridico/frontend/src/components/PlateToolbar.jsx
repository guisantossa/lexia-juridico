import { useEditor } from '@udecode/plate-common'
import { toggleMark } from '@udecode/plate-core'
import {
  MARK_BOLD,
  MARK_ITALIC,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-core'
import { ELEMENT_H1, ELEMENT_H2 } from '@udecode/plate-heading'

export function SimpleToolbar() {
  const editor = useEditor()
  return (
    <div className="flex gap-2 mb-2 bg-gray-100 p-2 rounded">
      <button onMouseDown={e => { e.preventDefault(); toggleMark(editor, { key: MARK_BOLD }) }}>
        Negrito
      </button>
      <button onMouseDown={e => { e.preventDefault(); toggleMark(editor, { key: MARK_ITALIC }) }}>
        Itálico
      </button>
      <button onMouseDown={e => { e.preventDefault(); toggleMark(editor, { key: ELEMENT_H1 }) }}>
        H1
      </button>
      <button onMouseDown={e => { e.preventDefault(); toggleMark(editor, { key: ELEMENT_H2 }) }}>
        H2
      </button>
      <button onMouseDown={e => { e.preventDefault(); toggleMark(editor, { key: ELEMENT_PARAGRAPH }) }}>
        Parágrafo
      </button>
    </div>
  )
}
