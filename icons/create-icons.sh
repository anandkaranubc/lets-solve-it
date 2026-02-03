#!/bin/bash
# Create simple placeholder icons using ImageMagick or sips (macOS)

# Try using sips (macOS built-in)
if command -v sips &> /dev/null; then
    echo "Creating icons using sips..."
    # Create a green square as base
    sips -s format png --out icon128.png ../leaf.png --resampleWidth 128 2>/dev/null || cp ../leaf.png icon128.png
    sips -z 48 48 icon128.png --out icon48.png 2>/dev/null
    sips -z 32 32 icon128.png --out icon32.png 2>/dev/null
    sips -z 16 16 icon128.png --out icon16.png 2>/dev/null
    echo "✅ Icons created!"
else
    echo "⚠️ Creating symlinks to leaf.png as placeholder..."
    ln -sf ../leaf.png icon128.png
    ln -sf ../leaf.png icon48.png
    ln -sf ../leaf.png icon32.png
    ln -sf ../leaf.png icon16.png
    echo "✅ Icon symlinks created!"
fi
