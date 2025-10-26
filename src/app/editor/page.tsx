import React from "react"
import { Editor, Navbar, Sidebar, Toolbar, Footer } from "@/features/components"

const NAVBAR_HEIGHT = "6rem"
const SIDEBAR_WIDTH = "12rem"
const TOOLBAR_HEIGHT = "5rem"
const FOOTER_HEIGHT = "5rem"

const EditorPage = () => {
  return (
    <div className="flex h-full w-full flex-col bg-muted">
      <Navbar className="border-2" style={{ height: NAVBAR_HEIGHT }} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="border-2" style={{ width: SIDEBAR_WIDTH }} />
        <main className="flex flex-col flex-1 overflow-auto">
          <Toolbar className="border-2" style={{ height: TOOLBAR_HEIGHT }} />
          <Editor className="flex-1 overflow-auto border-2" />
          <Footer className="border-2" style={{ height: FOOTER_HEIGHT }} />
        </main>
      </div>
    </div>
  )
}

export default EditorPage
