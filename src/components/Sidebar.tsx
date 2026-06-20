import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SidebarContent } from "./SidebarContent"
import { useSidebar } from "@/hooks/useSidebar"
import { useScrollLock } from "@/hooks/useScrollLock"

export function Sidebar() {
    const { isOpen, setIsOpen } = useSidebar()

    // Lock scroll when sidebar is open
    useScrollLock(isOpen)

    const handleClose = () => setIsOpen(false)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-muted/50 transition-colors h-8 w-8"
                >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="w-64 p-0 border-r border-border/40 bg-background/95 backdrop-blur-sm"
                showCloseButton={false}
            >
                <SidebarContent onClose={handleClose} />
            </SheetContent>
        </Sheet>
    )
}