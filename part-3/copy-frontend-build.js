const fs = require('fs')
const path = require('path')

const frontendDistPath = path.resolve(__dirname, '../part-2/phonebook/dist')
const backendDistPath = path.resolve(__dirname, 'dist')

if (!fs.existsSync(frontendDistPath)) {
    console.error('Frontend build not found. Run npm --prefix ../part-2/phonebook run build first.')
    process.exit(1)
}

fs.rmSync(backendDistPath, { recursive: true, force: true })
fs.cpSync(frontendDistPath, backendDistPath, { recursive: true })

console.log(`Copied frontend build from ${frontendDistPath} to ${backendDistPath}`)
