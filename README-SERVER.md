# How to Run Your Portfolio Locally

Since Python and Node.js aren't installed, here are the easiest ways to run your portfolio:

## Option 1: VS Code Live Server Extension (Recommended)

1. Open VS Code
2. Install the **"Live Server"** extension by Ritwick Dey
   - Press `Ctrl+Shift+X` to open Extensions
   - Search for "Live Server"
   - Click Install
3. Right-click on `index.html` in the file explorer
4. Select "Open with Live Server"
5. It will automatically open in your browser on a port (usually 5500)

## Option 2: Open HTML File Directly

Simply double-click `index.html` or right-click and choose "Open with" → Chrome/Edge

**Note:** Some features might not work perfectly when opening directly (like loading external resources), but most content will display.

## Option 3: Install Python (for the launch.json to work)

1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. After installation, run: `python -m http.server 8080`
4. Then your launch.json (F5) will work!

## Option 4: Install Node.js

1. Download Node.js from https://nodejs.org/
2. After installation, run: `npx http-server -p 8080`
3. Your launch.json (F5) will work!

---

**Recommendation:** Use Option 1 (Live Server extension) - it's the easiest and works great with VS Code!





