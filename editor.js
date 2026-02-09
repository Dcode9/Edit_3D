/**
 * Edit_3D Video Editor
 * Main application logic for video editing with photo-to-3D support
 * 
 * Architecture:
 * - Track-based timeline system with multiple layers
 * - Canvas-based preview rendering
 * - Integration with GaussianSplatting for 3D effects
 * - MediaRecorder API for export
 * - All processing happens client-side
 */

class VideoEditor {
    constructor() {
        this.tracks = [];
        this.selectedItem = null;
        this.clipboard = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.zoomLevel = 1;
        this.gaussianSplatting = new GaussianSplatting();
        this.items3D = new Map(); // Store 3D data for items
        this.objectURLs = new Set(); // Track created URLs for cleanup
        this.lastFrameTime = 0; // For accurate time tracking

        this.initializeEditor();
        this.setupEventListeners();
        this.createDefaultTracks();
    }

    initializeEditor() {
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.timelineTracksContainer = document.getElementById('timeline-tracks');
        this.playhead = document.getElementById('playhead');
        this.timeDisplay = document.getElementById('time-display');
    }

    setupEventListeners() {
        // Import buttons
        document.getElementById('import-video-btn').addEventListener('click', () => {
            document.getElementById('video-input').click();
        });

        document.getElementById('import-audio-btn').addEventListener('click', () => {
            document.getElementById('audio-input').click();
        });

        document.getElementById('import-image-btn').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });

        document.getElementById('import-3d-btn').addEventListener('click', () => {
            document.getElementById('photo-3d-input').click();
        });

        // File inputs
        document.getElementById('video-input').addEventListener('change', (e) => {
            this.handleVideoImport(e.target.files);
        });

        document.getElementById('audio-input').addEventListener('change', (e) => {
            this.handleAudioImport(e.target.files);
        });

        document.getElementById('image-input').addEventListener('change', (e) => {
            this.handleImageImport(e.target.files);
        });

        document.getElementById('photo-3d-input').addEventListener('change', (e) => {
            this.handlePhoto3DImport(e.target.files);
        });

        // Edit buttons
        document.getElementById('cut-btn').addEventListener('click', () => this.cutSelected());
        document.getElementById('copy-btn').addEventListener('click', () => this.copySelected());
        document.getElementById('paste-btn').addEventListener('click', () => this.paste());

        // Effect buttons
        document.getElementById('transition-btn').addEventListener('click', () => this.showTransitionModal());
        document.getElementById('add-layer-btn').addEventListener('click', () => this.addLayer());

        // Playback controls
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('stop-btn').addEventListener('click', () => this.stop());

        // Zoom controls
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => this.exportProject());

        // Modal controls
        const modal = document.getElementById('transition-modal');
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.querySelectorAll('.transition-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addTransition(e.target.dataset.type);
                modal.style.display = 'none';
            });
        });

        // Timeline interaction
        this.timelineTracksContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('track-item')) {
                this.selectItem(e.target);
            }
        });

        // Animation loop
        this.animationFrame = null;
        this.startAnimationLoop();
    }

    createDefaultTracks() {
        this.addTrack('video', 'Video Track 1');
        this.addTrack('video', 'Video Track 2');
        this.addTrack('audio', 'Audio Track 1');
        this.addTrack('audio', 'Audio Track 2');
    }

    addTrack(type, name) {
        const track = {
            id: `track-${Date.now()}-${Math.random()}`,
            type: type,
            name: name,
            items: []
        };

        this.tracks.push(track);
        this.renderTimeline();
        return track;
    }

    addLayer() {
        const layerCount = this.tracks.filter(t => t.type === 'video').length;
        this.addTrack('video', `Video Track ${layerCount + 1}`);
    }

    async handleVideoImport(files) {
        this.showLoading('Importing video...');

        for (const file of files) {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            this.objectURLs.add(url);
            video.src = url;
            
            video.addEventListener('loadedmetadata', () => {
                const item = {
                    id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`,
                    type: 'video',
                    name: file.name,
                    element: video,
                    duration: video.duration,
                    startTime: 0,
                    trimStart: 0,
                    trimEnd: video.duration
                };

                const videoTrack = this.tracks.find(t => t.type === 'video');
                if (videoTrack) {
                    videoTrack.items.push(item);
                    this.renderTimeline();
                }

                this.hideLoading();
            });
        }
    }

    async handleAudioImport(files) {
        this.showLoading('Importing audio...');

        for (const file of files) {
            const audio = new Audio();
            const url = URL.createObjectURL(file);
            this.objectURLs.add(url);
            audio.src = url;
            
            audio.addEventListener('loadedmetadata', () => {
                const item = {
                    id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`,
                    type: 'audio',
                    name: file.name,
                    element: audio,
                    duration: audio.duration,
                    startTime: 0,
                    trimStart: 0,
                    trimEnd: audio.duration
                };

                const audioTrack = this.tracks.find(t => t.type === 'audio');
                if (audioTrack) {
                    audioTrack.items.push(item);
                    this.renderTimeline();
                }

                this.hideLoading();
            });
        }
    }

    async handleImageImport(files) {
        this.showLoading('Importing images...');

        for (const file of files) {
            const img = new Image();
            const url = URL.createObjectURL(file);
            this.objectURLs.add(url);
            img.src = url;
            
            img.onload = () => {
                const item = {
                    id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`,
                    type: 'image',
                    name: file.name,
                    element: img,
                    duration: 5, // Default 5 seconds for images
                    startTime: 0
                };

                const videoTrack = this.tracks.find(t => t.type === 'video');
                if (videoTrack) {
                    videoTrack.items.push(item);
                    this.renderTimeline();
                }

                this.hideLoading();
            };
        }
    }

    async handlePhoto3DImport(files) {
        this.showLoading('Processing photo with Gaussian Splatting...');

        for (const file of files) {
            const img = new Image();
            const url = URL.createObjectURL(file);
            this.objectURLs.add(url);
            img.src = url;
            
            img.onload = async () => {
                try {
                    // Process image with Gaussian Splatting
                    const data3D = await this.gaussianSplatting.processImage(img, {
                        splattingIntensity: 0.6,
                        depthLayers: 12,
                        smoothingFactor: 2.5
                    });

                    const itemId = crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`;
                    const item = {
                        id: itemId,
                        type: '3d',
                        name: file.name,
                        element: img,
                        duration: 5, // Default 5 seconds
                        startTime: 0,
                        is3D: true
                    };

                    // Store 3D data
                    this.items3D.set(itemId, data3D);

                    const videoTrack = this.tracks.find(t => t.type === 'video');
                    if (videoTrack) {
                        videoTrack.items.push(item);
                        this.renderTimeline();
                    }

                    this.hideLoading();
                } catch (error) {
                    console.error('Error processing 3D photo:', error);
                    this.hideLoading();
                    alert('Error processing photo. Please try again.');
                }
            };
        }
    }

    renderTimeline() {
        this.timelineTracksContainer.innerHTML = '';

        this.tracks.forEach(track => {
            const trackEl = document.createElement('div');
            trackEl.className = 'track';
            trackEl.dataset.trackId = track.id;

            const trackHeader = document.createElement('div');
            trackHeader.className = 'track-header';
            trackHeader.innerHTML = `
                <span>${track.name}</span>
                <span>${track.type}</span>
            `;

            const trackContent = document.createElement('div');
            trackContent.className = 'track-content';

            track.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'track-item';
                if (item.is3D) {
                    itemEl.classList.add('type-3d');
                }
                itemEl.dataset.itemId = item.id;
                itemEl.style.width = `${item.duration * 50 * this.zoomLevel}px`;
                itemEl.innerHTML = `
                    <div>${item.name}</div>
                    <div style="font-size: 10px; opacity: 0.7;">${item.duration.toFixed(1)}s</div>
                `;

                trackContent.appendChild(itemEl);
            });

            trackEl.appendChild(trackHeader);
            trackEl.appendChild(trackContent);
            this.timelineTracksContainer.appendChild(trackEl);
        });
    }

    selectItem(element) {
        // Remove previous selection
        document.querySelectorAll('.track-item').forEach(el => {
            el.classList.remove('selected');
        });

        element.classList.add('selected');
        const itemId = element.dataset.itemId;
        
        // Find the item
        for (const track of this.tracks) {
            const item = track.items.find(i => i.id === itemId);
            if (item) {
                this.selectedItem = item;
                this.showProperties(item);
                break;
            }
        }
    }

    showProperties(item) {
        const propertiesContent = document.getElementById('properties-content');
        propertiesContent.innerHTML = `
            <div class="property-group">
                <label>Name</label>
                <input type="text" value="${item.name}" readonly>
            </div>
            <div class="property-group">
                <label>Type</label>
                <input type="text" value="${item.type}" readonly>
            </div>
            <div class="property-group">
                <label>Duration (seconds)</label>
                <input type="number" value="${item.duration}" min="0.1" step="0.1" id="duration-input">
            </div>
            ${item.is3D ? `
            <div class="property-group">
                <label>3D Effect</label>
                <select id="3d-effect-select">
                    <option value="none">None</option>
                    <option value="rotate">Rotate</option>
                    <option value="flip">Flip</option>
                    <option value="zoom">Zoom</option>
                </select>
            </div>
            ` : ''}
        `;

        // Add event listener for duration change
        const durationInput = document.getElementById('duration-input');
        if (durationInput) {
            durationInput.addEventListener('change', (e) => {
                item.duration = parseFloat(e.target.value);
                this.renderTimeline();
            });
        }

        // Add event listener for 3D effect change
        const effectSelect = document.getElementById('3d-effect-select');
        if (effectSelect) {
            effectSelect.addEventListener('change', (e) => {
                item.effect3D = e.target.value;
            });
        }
    }

    cutSelected() {
        if (this.selectedItem) {
            this.clipboard = { ...this.selectedItem };
            
            // Remove from track
            for (const track of this.tracks) {
                const index = track.items.findIndex(i => i.id === this.selectedItem.id);
                if (index !== -1) {
                    track.items.splice(index, 1);
                    break;
                }
            }

            this.selectedItem = null;
            this.renderTimeline();
        }
    }

    copySelected() {
        if (this.selectedItem) {
            this.clipboard = { ...this.selectedItem };
        }
    }

    paste() {
        if (this.clipboard) {
            const newItem = {
                ...this.clipboard,
                id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`
            };

            // If it's a 3D item, copy the 3D data
            if (newItem.is3D && this.items3D.has(this.clipboard.id)) {
                this.items3D.set(newItem.id, this.items3D.get(this.clipboard.id));
            }

            // Find appropriate track
            const track = this.tracks.find(t => t.type === this.clipboard.type || 
                (this.clipboard.type === 'image' && t.type === 'video') ||
                (this.clipboard.type === '3d' && t.type === 'video'));
            
            if (track) {
                track.items.push(newItem);
                this.renderTimeline();
            }
        }
    }

    /**
     * Clean up resources when editor is destroyed
     */
    cleanup() {
        // Revoke all object URLs to prevent memory leaks
        for (const url of this.objectURLs) {
            URL.revokeObjectURL(url);
        }
        this.objectURLs.clear();

        // Stop animation loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    showTransitionModal() {
        document.getElementById('transition-modal').style.display = 'block';
    }

    addTransition(type) {
        if (this.selectedItem) {
            const item = {
                id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`,
                type: 'transition',
                name: type,
                transitionType: type,
                duration: 1, // 1 second transition
                startTime: this.selectedItem.startTime + this.selectedItem.duration
            };

            const videoTrack = this.tracks.find(t => t.type === 'video');
            if (videoTrack) {
                videoTrack.items.push(item);
                this.renderTimeline();
            }
        }
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.updatePlayhead();
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.5, 5);
        this.renderTimeline();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel / 1.5, 0.5);
        this.renderTimeline();
    }

    startAnimationLoop() {
        const animate = (timestamp) => {
            if (this.isPlaying) {
                if (this.lastFrameTime === 0) {
                    this.lastFrameTime = timestamp;
                }
                const deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
                this.currentTime += deltaTime;
                this.lastFrameTime = timestamp;
                
                this.updatePlayhead();
                this.renderPreview();
            } else {
                this.lastFrameTime = 0; // Reset when not playing
            }

            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    updatePlayhead() {
        // Update time display
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = Math.floor(this.currentTime % 60);
        const totalMinutes = Math.floor(this.duration / 60);
        const totalSeconds = Math.floor(this.duration % 60);

        this.timeDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} / ` +
            `${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;

        // Update playhead position (guard against division by zero)
        if (this.duration > 0) {
            const timelineWidth = this.timelineTracksContainer.offsetWidth;
            const position = (this.currentTime / this.duration) * timelineWidth;
            this.playhead.style.left = `${position}px`;
        }
    }

    renderPreview() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render active items at current time
        for (const track of this.tracks) {
            for (const item of track.items) {
                if (this.currentTime >= item.startTime && 
                    this.currentTime < item.startTime + item.duration) {
                    
                    if (item.type === 'video') {
                        item.element.currentTime = this.currentTime - item.startTime;
                        this.ctx.drawImage(item.element, 0, 0, this.canvas.width, this.canvas.height);
                    } else if (item.type === 'image') {
                        this.ctx.drawImage(item.element, 0, 0, this.canvas.width, this.canvas.height);
                    } else if (item.type === '3d') {
                        const data3D = this.items3D.get(item.id);
                        if (data3D) {
                            const progress = (this.currentTime - item.startTime) / item.duration;
                            const effect = item.effect3D || 'rotate';
                            this.gaussianSplatting.renderTransition(this.canvas, data3D, progress, 
                                effect === 'none' ? '3d-rotate' : `3d-${effect}`);
                        }
                    }
                }
            }
        }
    }

    async exportProject() {
        this.showLoading('Exporting project...');

        try {
            // Check codec support and select best available
            let mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'video/webm';
                }
            }

            // Create a MediaRecorder to capture the canvas
            const stream = this.canvas.captureStream(30); // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, { mimeType });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `edit_3d_export_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                this.hideLoading();
            };

            // Start recording and play through timeline
            mediaRecorder.start();
            this.currentTime = 0;
            this.isPlaying = true;

            // Stop after duration
            setTimeout(() => {
                this.isPlaying = false;
                mediaRecorder.stop();
            }, this.duration * 1000);

        } catch (error) {
            console.error('Export error:', error);
            this.hideLoading();
            alert('Export failed. Please try again.');
        }
    }

    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'none';
    }
}

// Initialize the editor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.editor = new VideoEditor();
    });
} else {
    window.editor = new VideoEditor();
}
