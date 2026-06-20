import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SidebarContent } from "./SidebarContent"
import { useSidebar } from "@/hooks/useSidebar"

export function Sidebar() {
    const { isOpen, setIsOpen } = useSidebar()

    const handleClose = () => setIsOpen(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-muted/50 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="w-72 p-0 border-r border-border/40 bg-background/95 backdrop-blur-sm"
                showCloseButton={false}  // 👈 This removes the X button
            >
                <SidebarContent onClose={handleClose} />
            </SheetContent>
        </Sheet>
    )
}