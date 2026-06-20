import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public')
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
}

async function generateScreenshots() {
    console.log('📸 Starting screenshot generation...')

    // Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null
    })

    try {
        // Open the app
        const page = await browser.newPage()
        await page.goto('http://localhost:5173', {
            waitUntil: 'networkidle0',
            timeout: 30000
        })

        // Wait for content to load
        await page.waitForSelector('#root', { timeout: 10000 })

        // 1. Mobile Screenshot (narrow)
        console.log('📱 Taking mobile screenshot...')
        await page.setViewport({
            width: 1080,
            height: 1920,
            deviceScaleFactor: 2
        })
        // Wait for layout to settle using setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        await page.screenshot({
            path: path.join(publicDir, 'screenshot-mobile.png'),
            fullPage: true
        })
        console.log('✅ Mobile screenshot saved!')

        // 2. Desktop Screenshot (wide)
        console.log('💻 Taking desktop screenshot...')
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
        await page.screenshot({
            path: path.join(publicDir, 'screenshot-desktop.png'),
            fullPage: true
        })
        console.log('✅ Desktop screenshot saved!')

        console.log('🎉 All screenshots generated successfully!')

    } catch (error) {
        console.error('❌ Error generating screenshots:', error)
    } finally {
        await browser.close()
    }
}

// Run the script
generateScreenshots()