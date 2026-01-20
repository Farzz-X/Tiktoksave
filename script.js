let currentQuality = 'hd';
        let downloadHistory = JSON.parse(localStorage.getItem('tiktokHistory')) || [];

        // DOM Elements
        const tiktokUrl = document.getElementById('tiktokUrl');
        const downloadBtn = document.getElementById('downloadButton');
        const loading = document.getElementById('loading');
        const resultDiv = document.getElementById('result');
        const historyList = document.getElementById('historyList');

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            renderHistory();
            tiktokUrl.focus();
            
            // Load saved URL from localStorage
            const savedUrl = localStorage.getItem('lastTiktokUrl');
            if (savedUrl) {
                tiktokUrl.value = savedUrl;
            }
        });
 document.getElementById('pasteBtn').addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text.includes('tiktok.com')) {
                    tiktokUrl.value = text.trim();
                    showNotification('URL berhasil ditempel dari clipboard!', 'success');
                } else {
                    showNotification('Clipboard tidak berisi URL TikTok yang valid', 'error');
                }
            } catch (err) {
                // Fallback untuk browser lama
                tiktokUrl.focus();
                document.execCommand('paste');
                setTimeout(() => {
                    tiktokUrl.value = tiktokUrl.value.trim();
                }, 100);
            }
        });
        document.getElementById('exampleBtn').addEventListener('click', () => {
            const examples = [
                'https://www.tiktok.com/@example/video/1234567890',
                'https://vt.tiktok.com/ABC123DEF/',
                'https://www.tiktok.com/t/ZTR7XgG3k/'
            ];
            const randomExample = examples[Math.floor(Math.random() * examples.length)];
            tiktokUrl.value = randomExample;
            showNotification('Contoh URL TikTok ditambahkan', 'info');
        });
 document.getElementById('clearBtn').addEventListener('click', () => {
            tiktokUrl.value = '';
            resultDiv.style.display = 'none';
            tiktokUrl.focus();
            showNotification('Input dibersihkan', 'info');
        });

       document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentQuality = this.dataset.quality;
                showNotification(`Kualitas dipilih: ${this.textContent}`, 'info');
            });
        });
 document.getElementById('bookmarkBtn').addEventListener('click', function() {
            const url = tiktokUrl.value.trim();
            if (!url) {
                showNotification('Masukkan URL terlebih dahulu', 'error');
                return;
            }

            const bookmarks = JSON.parse(localStorage.getItem('tiktokBookmarks')) || [];
            
            if (bookmarks.includes(url)) {
                // Remove bookmark
                const index = bookmarks.indexOf(url);
                bookmarks.splice(index, 1);
                this.innerHTML = '<i class="far fa-bookmark"></i>';
                showNotification('Bookmark dihapus', 'info');
            } else {
                // Add bookmark
                bookmarks.push(url);
                this.innerHTML = '<i class="fas fa-bookmark"></i>';
                showNotification('URL disimpan ke bookmark', 'success');
            }
            
            localStorage.setItem('tiktokBookmarks', JSON.stringify(bookmarks));
            this.classList.toggle('active');
        });        
        document.getElementById('processBatch').addEventListener('click', async () => {
            const batchUrls = document.getElementById('batchUrls').value.trim();
            if (!batchUrls) {
                showNotification('Masukkan URL terlebih dahulu', 'error');
                return;
            }

            const urls = batchUrls.split('\n').filter(url => url.trim() !== '' && url.includes('tiktok.com'));
            
            if (urls.length === 0) {
                showNotification('Tidak ada URL TikTok yang valid', 'error');
                return;
            }

            showNotification(`Memproses ${urls.length} video...`, 'info');
            
            // Process first URL as example
            if (urls.length > 0) {
                tiktokUrl.value = urls[0];
                await processDownload(urls[0]);
            }
        });

        document.getElementById('downloadAll').addEventListener('click', async () => {
            const batchUrls = document.getElementById('batchUrls').value.trim();
            if (!batchUrls) {
                showNotification('Masukkan URL terlebih dahulu', 'error');
                return;
            }

            const urls = batchUrls.split('\n').filter(url => url.trim() !== '' && url.includes('tiktok.com'));
            
            if (urls.length === 0) {
                showNotification('Tidak ada URL TikTok yang valid', 'error');
                return;
            }

            showNotification(`Mendownload ${urls.length} video...`, 'info');
            
            // Create multiple download links
            urls.forEach((url, index) => {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = `https://website-restapii.vercel.app/tiktok?url=${encodeURIComponent(url)}`;
                    a.target = '_blank';
                    a.download = `tiktok_video_${index + 1}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }, index * 1000); // Stagger downloads
            });
        });

        document.getElementById('clearBatch').addEventListener('click', () => {
            document.getElementById('batchUrls').value = '';
            showNotification('Batch input dibersihkan', 'info');
        });

        // ======================
        // FITUR 7: DOWNLOAD HISTORY
        // ======================
        function addToHistory(videoData) {
            const historyItem = {
                id: Date.now(),
                url: videoData.url,
                author: videoData.author || 'Unknown',
                title: videoData.title || 'TikTok Video',
                thumbnail: videoData.thumbnail || '',
                date: new Date().toLocaleString()
            };

            downloadHistory.unshift(historyItem);
            if (downloadHistory.length > 10) {
                downloadHistory = downloadHistory.slice(0, 10);
            }

            localStorage.setItem('tiktokHistory', JSON.stringify(downloadHistory));
            renderHistory();
        }

        function renderHistory() {
            historyList.innerHTML = '';
            
            if (downloadHistory.length === 0) {
                historyList.innerHTML = `
                    <div class="history-item">
                        <p style="color: var(--text-secondary); text-align: center; width: 100%;">
                            <i class="fas fa-history"></i> Belum ada riwayat download
                        </p>
                    </div>
                `;
                return;
            }

            downloadHistory.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <img src="${item.thumbnail}" 
                         alt="${item.title}" 
                         class="history-thumbnail"
                         onerror="this.src='https://via.placeholder.com/60/FF2D55/ffffff?text=TK'">
                    <div class="history-info">
                        <h4>${item.author}</h4>
                        <p>${item.title.substring(0, 50)}${item.title.length > 50 ? '...' : ''}</p>
                        <small style="color: var(--text-secondary);">${item.date}</small>
                    </div>
                    <div class="history-actions">
                        <button class="history-btn" onclick="redownload('${item.url}')">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="history-btn" onclick="removeFromHistory(${item.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                historyList.appendChild(historyItem);
            });
        }

        function redownload(url) {
            tiktokUrl.value = url;
            showNotification('URL dimuat ulang', 'info');
            tiktokUrl.focus();
        }

        function removeFromHistory(id) {
            downloadHistory = downloadHistory.filter(item => item.id !== id);
            localStorage.setItem('tiktokHistory', JSON.stringify(downloadHistory));
            renderHistory();
            showNotification('Riwayat dihapus', 'info');
        }

        document.getElementById('clearHistory').addEventListener('click', () => {
            if (confirm('Hapus semua riwayat download?')) {
                downloadHistory = [];
                localStorage.removeItem('tiktokHistory');
                renderHistory();
                showNotification('Semua riwayat dihapus', 'info');
            }
        });

        // ======================
        // MAIN DOWNLOAD FUNCTION
        // ======================
        downloadBtn.addEventListener('click', async () => {
            const url = tiktokUrl.value.trim();
            await processDownload(url);
        });

        async function processDownload(url) {
            // Validate input
            if (!url) {
                showNotification('Harap masukkan URL TikTok!', 'error');
                tiktokUrl.focus();
                return;
            }

            if (!url.includes('tiktok.com')) {
                showNotification('URL TikTok tidak valid!', 'error');
                return;
            }

            // Save URL to localStorage
            localStorage.setItem('lastTiktokUrl', url);

            // Show loading
            downloadBtn.disabled = true;
            loading.style.display = 'block';
            resultDiv.style.display = 'none';

            try {
                // Fetch video data
                const metaResponse = await fetch(`https://website-restapii.vercel.app/tiktok?url=${encodeURIComponent(url)}`);
                const data = await metaResponse.json();

                const detailedResponse = await fetch(`https://website-restapii.vercel.app/tiktokdll?url=${encodeURIComponent(url)}`);
                const tik = await detailedResponse.json();

                if (!data.result || !tik.result || !tik.result.data) {
                    throw new Error("Gagal mengambil data video");
                }

                // Create download links based on quality selection
                const videoUrl = data.result.watermark;
                const audioUrl = tik.result.data.music;
                
                let downloadUrl = videoUrl;
                let downloadText = 'Download Video';
                
                if (currentQuality === 'audio') {
                    downloadUrl = audioUrl;
                    downloadText = 'Download Audio';
                }

                // Display result
                resultDiv.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
               <div class="result-author">
                   
                            <img src="${tik.result.data.author.avatar}" 
                                 alt="${data.result.author}" 
                                 style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary);">
                          <div class="result-author-text">
                                <h3 style="margin-bottom: 8px;">${data.result.author || 'TikTok User'}</h3>
                                <p style="color: var(--text-secondary);">${data.result.title || 'TikTok Video'}</p>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 30px; text-align: center;">
                            <video controls autoplay muted style="width: 100%; max-width: 500px; border-radius: var(--radius-md);">
                                <source src="${tik.result.data.play}" type="video/mp4">
                            </video>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <a href="${downloadUrl}" 
                               target="_blank" 
                               download 
                               style="padding: 16px; background: var(--primary); color: white; text-decoration: none; border-radius: var(--radius-md); text-align: center; font-weight: 600;">
                                <i class="fas fa-download"></i> ${downloadText}
                            </a>
                            <button onclick="copyToClipboard('${url}')" 
                                    style="padding: 16px; background: white; border: 2px solid var(--primary); color: var(--primary); border-radius: var(--radius-md); cursor: pointer; font-weight: 600;">
                                <i class="fas fa-copy"></i> Copy Link
                            </button>
                            <button onclick="shareVideo('${url}')" 
                                    style="padding: 16px; background: white; border: 2px solid var(--border); color: var(--text-primary); border-radius: var(--radius-md); cursor: pointer; font-weight: 600;">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                `;

                // Add to history
                addToHistory({
                    url: url,
                    author: data.result.author,
                    title: data.result.title,
                    thumbnail: tik.result.data.author.avatar
                });

                // Show result
                loading.style.display = 'none';
                resultDiv.style.display = 'block';
                resultDiv.scrollIntoView({ behavior: 'smooth' });
                showNotification('Video berhasil dimuat!', 'success');

            } catch (error) {
                console.error('Error:', error);
                showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            } finally {
                downloadBtn.disabled = false;
                loading.style.display = 'none';
            }
        }

        // ======================
        // UTILITY FUNCTIONS
        // ======================
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: var(--radius-md);
                color: white;
                font-weight: 500;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
                background: ${type === 'error' ? '#FF3B30' : type === 'info' ? '#007AFF' : '#34C759'};
                box-shadow: var(--shadow-md);
            `;
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Link berhasil disalin!', 'success');
            });
        }

        function shareVideo(url) {
            if (navigator.share) {
                navigator.share({
                    title: 'TikTok Video',
                    text: 'Check out this TikTok video!',
                    url: url
                });
            } else {
                copyToClipboard(url);
            }
        }

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
