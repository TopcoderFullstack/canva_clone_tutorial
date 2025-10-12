import { FabricProvider } from "@/lib/providers/fabric-provider"
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FabricProvider>{children}</FabricProvider>
}
