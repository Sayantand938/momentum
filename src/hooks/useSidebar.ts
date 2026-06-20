import { useState } from "react"

export function useSidebar() {
    const [isOpen, setIsOpen] = useState(false)

    const openSidebar = () => setIsOpen(true)
    const closeSidebar = () => setIsOpen(false)
    const toggleSidebar = () => setIsOpen((prev) => !prev)

    return {
        isOpen,
        setIsOpen, // Added this to fix the error
        openSidebar,
        closeSidebar,
        toggleSidebar,
    }
}