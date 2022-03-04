import { EditorState, Transaction } from "prosemirror-state"
import { createRichTextEditor } from "./create.js"
import { describe, expect, it, jest } from "@jest/globals"
import { findByText, queryByText } from "@testing-library/dom"
import { testEditorState } from "./fixtures/testState.js"

describe("createRichTextEditor", () => {
  it("initializes an editor with the correct content", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()

    createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    await findByText(node, "Example content")
  })

  it("returns the expected API shape", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()

    const returnValue = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    expect(Object.keys(returnValue)).toEqual(["destroy", "dispatchTransaction"])
    expect(typeof returnValue.destroy).toEqual("function")
    expect(typeof returnValue.dispatchTransaction).toEqual("function")
  })

  it("destroys the instance", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()

    const { destroy } = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    await findByText(node, "Example content")

    destroy()

    expect(await queryByText(node, "Example content")).toBeNull()
  })

  it("updates the DOM when commands are dispatched", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()
    const command = (
      state: EditorState,
      dispatch: (tx: Transaction) => void
    ) => {
      // Insert text at the current selection point, which is the start because
      // we don’t have a selection yet.
      dispatch(state.tr.insertText("Prepended content. "))
      return true
    }

    const { dispatchTransaction } = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    await findByText(node, "Example content")

    dispatchTransaction(command)

    await findByText(node, "Prepended content. Example content")
  })

  it("calls onChange when the editor state changes", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()
    const command = (
      state: EditorState,
      dispatch: (tx: Transaction) => void
    ) => {
      dispatch(state.tr.insertText("Prepended content. "))
      return true
    }

    const { dispatchTransaction } = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    expect(onChange).not.toHaveBeenCalled()

    dispatchTransaction(command)

    expect(onChange).toHaveBeenCalled()
  })

  it("calls onChange with the updated state", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()
    const command = (
      state: EditorState,
      dispatch: (tx: Transaction) => void
    ) => {
      dispatch(state.tr.insertText("Prepended content. "))
      return true
    }

    const { dispatchTransaction } = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    dispatchTransaction(command)

    const updatedEditorState: EditorState = onChange.mock.calls[0][0]

    expect(updatedEditorState.toJSON()).toMatchSnapshot()
  })

  it("defaults to editable", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()

    createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
    })

    expect(node.children[0]?.getAttribute("contenteditable")).toBe("true")
  })

  it("respects initial isEditable value", async () => {
    const node = document.createElement("div")
    const onChange = jest.fn()

    createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
      isEditable: () => false,
    })

    expect(node.children[0]?.getAttribute("contenteditable")).toBe("false")
  })

  it("updates editable status", async () => {
    let editable = true
    const node = document.createElement("div")
    const onChange = jest.fn()
    const noopCommand = (
      state: EditorState,
      dispatch: (tx: Transaction) => void
    ) => {
      dispatch(state.tr)
      return true
    }

    const { dispatchTransaction } = createRichTextEditor({
      node,
      onChange,
      initialEditorState: testEditorState,
      isEditable: () => editable,
    })

    expect(node.children[0]?.getAttribute("contenteditable")).toBe("true")

    editable = false
    dispatchTransaction(noopCommand)

    expect(node.children[0]?.getAttribute("contenteditable")).toBe("false")
  })
})
