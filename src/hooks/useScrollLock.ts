import { useEffect } from 'react'

export function useScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            // Get current scroll position
            const scrollY = window.scrollY

            // Lock body scroll
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollY}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.overflow = 'hidden'
            document.body.style.width = '100%'

            // Store the scroll position to restore later
            document.body.dataset.scrollY = String(scrollY)
        } else {
            // Restore scroll
            const scrollY = Number(document.body.dataset.scrollY || 0)
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.left = ''
            document.body.style.right = ''
            document.body.style.overflow = ''
            document.body.style.width = ''

            // Restore scroll position
            window.scrollTo(0, scrollY)
        }

        return () => {
            // Cleanup
            const scrollY = Number(document.body.dataset.scrollY || 0)
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.left = ''
            document.body.style.right = ''
            document.body.style.overflow = ''
            document.body.style.width = ''
            window.scrollTo(0, scrollY)
        }
    }, [isLocked])
}