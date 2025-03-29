document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const photoCounter = document.getElementById('photoCounter');
    let currentIndex = 0;
    let uploadedPhotos = [];
    
    // 获取所有照片项
    function getGalleryItems() {
        return document.querySelectorAll('.gallery-item');
    }

    // 更新照片计数器
    function updatePhotoCounter() {
        const items = getGalleryItems();
        photoCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    }

    // 切换到指定照片
    function goToPhoto(index) {
        const items = getGalleryItems();
        if (items.length === 0) return;

        // 移除所有活动状态
        items.forEach(item => item.classList.remove('active'));
        
        // 确保索引在有效范围内
        if (index < 0) {
            index = items.length - 1;
        } else if (index >= items.length) {
            index = 0;
        }
        
        // 添加新的活动状态
        items[index].classList.add('active');
        currentIndex = index;
        updatePhotoCounter();
    }

    // 上一张照片
    function prevPhoto() {
        goToPhoto(currentIndex - 1);
    }

    // 下一张照片
    function nextPhoto() {
        goToPhoto(currentIndex + 1);
    }

    // 创建照片卡片
    function createPhotoCard(photo) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
            <img src="${photo.src}" alt="${photo.title}" loading="lazy">
            <div class="overlay">
                <h3>${photo.title}</h3>
                <p>${photo.date}</p>
            </div>
        `;
        return div;
    }

    // 创建预览项
    function createPreviewItem(file) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            div.remove();
            // 从上传列表中移除
            uploadedPhotos = uploadedPhotos.filter(p => p.file !== file);
            // 从照片墙中移除对应的照片
            const items = getGalleryItems();
            items.forEach(item => {
                if (item.querySelector('img').src === img.src) {
                    item.remove();
                    updatePhotoCounter();
                }
            });
        };
        
        div.appendChild(img);
        div.appendChild(removeBtn);
        return div;
    }

    // 加载images目录下的所有照片
    async function loadInitialPhotos() {
        try {
            const response = await fetch('/images');
            const files = await response.json();
            
            // 清空现有照片
            gallery.innerHTML = '';
            
            // 过滤并排序图片文件
            const imageFiles = files.filter(file => {
                const fileType = file.toLowerCase();
                return fileType.endsWith('.jpg') || 
                       fileType.endsWith('.jpeg') || 
                       fileType.endsWith('.png');
            }).sort((a, b) => a.localeCompare(b)); // 按文件名排序
            
            // 加载所有图片
            imageFiles.forEach(file => {
                const photoCard = createPhotoCard({
                    src: `/images/${file}`,
                    title: file.split('.')[0],
                    date: new Date().toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                });
                gallery.appendChild(photoCard);
                
                // 为照片添加点击放大效果
                photoCard.addEventListener('click', () => {
                    showModal(photoCard.querySelector('img'), photoCard.querySelector('.overlay'));
                });
            });
            
            // 更新照片计数器和显示
            updatePhotoCounter();
            goToPhoto(0);
        } catch (error) {
            console.error('加载照片失败:', error);
        }
    }

    // 处理文件上传
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // 检查文件类型是否为图片
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();
            if (fileType.startsWith('image/') || 
                fileName.endsWith('.png') || 
                fileName.endsWith('.jpg') || 
                fileName.endsWith('.jpeg') ||
                fileType === 'image/jpeg' ||
                fileType === 'image/jpg') {
                
                const previewItem = createPreviewItem(file);
                previewContainer.appendChild(previewItem);
                
                // 添加到上传列表
                uploadedPhotos.push({
                    file: file,
                    title: file.name.split('.')[0],
                    date: new Date().toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                });
                
                // 自动添加到照片墙
                const photoCard = createPhotoCard({
                    src: URL.createObjectURL(file),
                    title: file.name.split('.')[0],
                    date: new Date().toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                });
                gallery.appendChild(photoCard);
                
                // 为新添加的照片添加点击放大效果
                photoCard.addEventListener('click', () => {
                    showModal(photoCard.querySelector('img'), photoCard.querySelector('.overlay'));
                });
            }
        });
        
        // 清空文件输入框，允许重复选择同一文件
        fileInput.value = '';
    });

    // 显示模态框
    function showModal(img, overlay) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '&times;';
        
        const modalImg = document.createElement('img');
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = overlay.querySelector('h3').textContent;
        
        const modalDesc = document.createElement('p');
        modalDesc.textContent = overlay.querySelector('p').textContent;
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalImg);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalDesc);
        modal.appendChild(modalContent);
        
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90vh;
            }
            .modal-content img {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
            }
            .close-btn {
                position: absolute;
                top: -40px;
                right: 0;
                color: white;
                font-size: 30px;
                cursor: pointer;
            }
            .modal-content h3 {
                color: white;
                margin-top: 10px;
                text-align: center;
            }
            .modal-content p {
                color: #ccc;
                text-align: center;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 添加导航按钮事件监听
    prevBtn.addEventListener('click', prevPhoto);
    nextBtn.addEventListener('click', nextPhoto);

    // 添加键盘导航
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevPhoto();
        } else if (e.key === 'ArrowRight') {
            nextPhoto();
        }
    });

    // 初始化照片计数器和显示
    updatePhotoCounter();
    goToPhoto(0);
    
    // 加载初始照片
    loadInitialPhotos();
}); 