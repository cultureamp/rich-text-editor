import { EditorState } from "prosemirror-state"
import { MarkType } from "prosemirror-model"
import { getMarkRange } from "./getMarkRange.js"
import { markIsActive } from "./markIsActive.js"

export function markContainsSelection(
  state: EditorState,
  markType: MarkType
): boolean {
  if (!markIsActive(state, markType)) {
    return false
  }
  const { selection } = state
  const { $from } = selection
  const markRange = getMarkRange($from, markType)
  return (
    !!markRange &&
    markRange.from <= selection.from &&
    markRange.to >= selection.to
  )
}
