# Edit_3D - Web-Based Video Editor with Photo-to-3D

A full-featured, local web-based video editor that runs entirely in your browser with advanced 3D capabilities powered by Gaussian Splatting.

## 🌟 Features

### Core Video Editing
- **Timeline Editor**: Multi-track timeline with zoom controls
- **Multiple Format Support**: Import and edit videos, audio, and images
- **Cut, Copy, Paste**: Standard editing operations for all media types
- **Transitions**: Multiple transition effects including fade, slide, zoom, and 3D transitions
- **Multiple Layers**: Support for multiple video/image layers
- **Multiple Audio Tracks**: Layer multiple audio tracks for complex soundscapes

### 🎯 Photo to 3D (NEW)
- **Gaussian Splatting**: Advanced depth map generation from single photos
- **iPhone Optimized**: Designed to work seamlessly with iPhone photos
- **3D Animations**: Animate still images with 3D effects
- **3D Transitions**: Create stunning 3D transitions between clips
- **Real-time Preview**: See 3D effects in real-time

### Mobile Optimization
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **iPhone Support**: Optimized for iPhone Safari with camera integration
- **Touch Controls**: Touch-friendly interface for mobile editing
- **PWA Ready**: Can be installed as a progressive web app

## 🚀 Getting Started

### Quick Start

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No server or installation required - everything runs locally!

2. **Import Media**
   - Click "Video" to import video files
   - Click "Audio" to import audio tracks
   - Click "Image" to import static images
   - Click "Photo to 3D" to import and process iPhone photos

3. **Edit Your Content**
   - Drag items on the timeline to arrange them
   - Use Cut, Copy, Paste to manipulate clips
   - Add transitions between clips
   - Layer multiple tracks for complex compositions

4. **Add 3D Effects**
   - Import a photo using "Photo to 3D"
   - The photo will be processed with Gaussian Splatting
   - Select the 3D item and choose an effect (Rotate, Flip, Zoom)
   - The photo will animate with realistic 3D depth

5. **Export Your Project**
   - Click "Export" to render your final video
   - The video will be downloaded as a WebM file

## 📱 Using on iPhone

1. Open Safari on your iPhone
2. Navigate to the application (host it locally or use a web server)
3. Tap "Photo to 3D" button
4. Grant camera permissions when prompted
5. Take a photo or select from library
6. The photo will be processed into 3D automatically

## 🎨 How Photo-to-3D Works

The Photo-to-3D feature uses a simplified Gaussian Splatting technique:

1. **Depth Map Generation**: Analyzes the photo using luminance and edge detection to estimate depth
2. **Gaussian Splatting**: Applies Gaussian filters to smooth and enhance depth information
3. **Point Cloud Creation**: Generates a 3D point cloud from the depth data
4. **Real-time Rendering**: Renders the 3D effect with customizable animations

### Supported 3D Effects
- **Rotate**: Smooth 3D rotation revealing depth layers
- **Flip**: Flip the image revealing the 3D structure
- **Zoom**: Zoom in/out with parallax depth effect

## 🛠️ Technical Details

### Architecture
- **Pure JavaScript**: No build tools or dependencies required
- **Canvas-based Rendering**: Uses HTML5 Canvas for all rendering
- **Local Processing**: All processing happens on the client device
- **No Server Required**: Runs entirely in the browser

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+ (iOS Safari 14+)
- Opera 76+

### Performance
- Optimized for mobile devices
- Efficient memory usage
- Hardware-accelerated canvas rendering
- Adaptive quality based on device capabilities

## 📂 Project Structure

```
Edit_3D/
├── index.html              # Main HTML structure
├── styles.css              # Responsive styling
├── editor.js               # Core editor logic
├── gaussian-splatting.js   # 3D processing engine
└── README.md              # This file
```

## 🎬 Workflow Example

1. **Import video clips** or **take iPhone photos**
2. **Process photos to 3D** using the Gaussian Splatting feature
3. **Arrange clips** on the timeline
4. **Add 3D transitions** between scenes
5. **Layer multiple tracks** for picture-in-picture effects
6. **Add audio tracks** for background music and sound effects
7. **Preview in real-time**
8. **Export the final video**

## 🔒 Privacy & Security

- **100% Local**: All processing happens on your device
- **No Cloud Upload**: Your media never leaves your browser
- **No Tracking**: No analytics or tracking code
- **Secure**: No external dependencies or third-party services

## 🌐 Hosting Options

### Local Development
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000
```

### Production Deployment
- Upload all files to any static web host
- Works with GitHub Pages, Netlify, Vercel, etc.
- No server-side processing required

## 🤝 Contributing

This project is designed to be simple and maintainable. Contributions are welcome!

## 📄 License

Open source - feel free to use and modify for your projects.

## 🙏 Acknowledgments

- Gaussian Splatting technique inspired by modern 3D reconstruction methods
- Designed for iPhone photography but works with any image source
- Built with modern web standards for maximum compatibility

## 💡 Tips

- **iPhone Photos**: Photos taken with Portrait mode will show better 3D effects
- **Performance**: Reduce image resolution for faster processing on mobile
- **Transitions**: Use 3D transitions sparingly for the best visual impact
- **Audio**: Sync audio tracks with visual transitions for professional results

## 🐛 Troubleshooting

### Photo to 3D not working
- Ensure browser permissions for camera access are granted
- Try with a different image if processing fails
- Check browser console for error messages

### Export not working
- Ensure sufficient storage space
- Try a shorter video duration
- Check browser compatibility for MediaRecorder API

### Performance issues
- Close other browser tabs
- Reduce timeline zoom level
- Use lower resolution images

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Enjoy creating stunning videos with 3D effects!** 🎥✨