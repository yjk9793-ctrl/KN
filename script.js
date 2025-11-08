// ============================================
// K&Partners - Modern JavaScript
// ============================================

// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const pdfFileInput = document.getElementById('pdfFileInput');
const uploadArea = document.getElementById('uploadArea');
const filesList = document.getElementById('filesList');
const boardTableBody = document.getElementById('boardTableBody');
const boardDetailContainer = document.getElementById('boardDetail');
const boardTotalCount = document.getElementById('boardTotalCount');
const boardNewCount = document.getElementById('boardNewCount');
const boardViewCount = document.getElementById('boardViewCount');
const boardSearchInput = document.getElementById('boardSearchInput');
const boardFilterButtons = document.querySelectorAll('.board-filter-button');
const podcastList = document.getElementById('podcastList');

// ============================================
// Navigation Functions
// ============================================

// Mobile Menu Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Navbar Scroll Effect
let lastScroll = 0;
if (navbar) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Smooth Scrolling for Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ============================================
// Scroll Animations (Intersection Observer)
// ============================================

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// ============================================
// Service Type Selection
// ============================================

window.setServiceType = function(serviceType) {
    const serviceTypeInput = document.getElementById('serviceType');
    const serviceDisplayGroup = document.getElementById('serviceDisplayGroup');
    const selectedService = document.getElementById('selectedService');
    
    if (serviceTypeInput && serviceDisplayGroup && selectedService) {
        serviceTypeInput.value = serviceType;
        selectedService.textContent = serviceType;
        serviceDisplayGroup.style.display = 'block';
        
        // 스크롤 to contact form
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const offsetTop = contactSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
};

// ============================================
// Contact Form Handling
// ============================================

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            serviceType: document.getElementById('serviceType').value || '일반 문의',
            message: document.getElementById('message').value.trim()
        };

        // Validation
        const validation = validateForm(formData);
        if (validation.valid) {
            try {
                // 이메일 발송
                await sendEmail(formData);
                
                showNotification('문의가 성공적으로 전송되었습니다! 빠른 시일 내에 연락드리겠습니다.', 'success');
                contactForm.reset();
                
                // 서비스 선택 필드 초기화
                const serviceDisplayGroup = document.getElementById('serviceDisplayGroup');
                if (serviceDisplayGroup) {
                    serviceDisplayGroup.style.display = 'none';
                }
                const serviceTypeInput = document.getElementById('serviceType');
                if (serviceTypeInput) {
                    serviceTypeInput.value = '';
                }
            } catch (error) {
                console.error('Email send error:', error);
                showNotification('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
            }
        } else {
            // 상세한 에러 메시지 표시
            const errorMessage = validation.errors.length > 0 
                ? validation.errors.join(' ')
                : '모든 필드를 올바르게 입력해주세요.';
            showNotification(errorMessage, 'error');
        }
    });
}

// Form Validation
function validateForm(data) {
    const errors = [];
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('성명을 2글자 이상 입력해주세요.');
        return { valid: false, errors };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('올바른 이메일 주소를 입력해주세요.');
        return { valid: false, errors };
    }

    // Message validation (최소 5글자로 완화)
    if (!data.message || data.message.trim().length < 5) {
        errors.push('문의 내용을 5글자 이상 입력해주세요.');
        return { valid: false, errors };
    }

    return { valid: true, errors: [] };
}

// ============================================
// Email Sending Function
// ============================================

async function sendEmail(formData) {
    try {
        // Vercel API Route를 통한 이메일 발송
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
        }

        return Promise.resolve();
    } catch (error) {
        console.error('Email send error:', error);
        
        // API Route가 실패한 경우 mailto 링크로 대체
        const subject = encodeURIComponent(`[K&Partners 문의] ${formData.serviceType || '일반 문의'} - ${formData.name}`);
        const body = encodeURIComponent(
            `서비스 유형: ${formData.serviceType || '일반 문의'}\n\n` +
            `성명: ${formData.name}\n` +
            `이메일: ${formData.email}\n\n` +
            `문의 내용:\n${formData.message}`
        );
        
        const mailtoLink = `mailto:yjk9793@naver.com?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        return Promise.resolve();
    }
}

// ============================================
// PDF Upload and Download
// ============================================

let uploadedFiles = [];

// Upload area click
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        if (pdfFileInput) {
            pdfFileInput.click();
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-primary)';
        uploadArea.style.background = 'rgba(255, 255, 255, 0.08)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.background = 'var(--glass-bg)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.background = 'var(--glass-bg)';
        
        const files = Array.from(e.dataTransfer.files);
        handleFilesUpload(files);
    });
}

// File input change
if (pdfFileInput) {
    pdfFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFilesUpload(files);
    });
}

// Handle multiple files upload
function handleFilesUpload(files) {
    files.forEach(file => {
        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            showNotification(`${file.name}은 PDF 파일이 아닙니다.`, 'error');
            return;
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showNotification(`${file.name}의 크기는 10MB 이하여야 합니다.`, 'error');
            return;
        }

        // Add file to uploaded files array
        const fileData = {
            id: Date.now() + Math.random(),
            file: file,
            uploadDate: new Date()
        };
        uploadedFiles.push(fileData);
        
        // Display file card
        displayFileCard(fileData);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Display file card
function displayFileCard(fileData) {
    if (!filesList) return;

    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.dataset.fileId = fileData.id;
    
    fileCard.innerHTML = `
        <div class="file-card-header">
            <div class="file-card-info">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <div class="file-card-details">
                    <span class="file-card-name">${fileData.file.name}</span>
                    <span class="file-card-size">${formatFileSize(fileData.file.size)}</span>
                </div>
            </div>
            <button class="remove-file-btn" onclick="removeFile(${fileData.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="file-card-body">
            <button class="file-download-btn" onclick="downloadFile(${fileData.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                다운로드
            </button>
        </div>
    `;
    
    filesList.appendChild(fileCard);
}

// Remove file
window.removeFile = function(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    const fileCard = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileCard) {
        fileCard.remove();
    }
};

// Download file
window.downloadFile = function(fileId) {
    const fileData = uploadedFiles.find(f => f.id === fileId);
    if (!fileData) {
        showNotification('파일을 찾을 수 없습니다.', 'error');
        return;
    }

    // Create download link
    const url = URL.createObjectURL(fileData.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('다운로드가 시작되었습니다!', 'success');
};

// ============================================
// Notification System
// ============================================

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
        font-size: 0.95rem;
    `;

    // Add animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ============================================
// Add CSS for file cards
// ============================================

if (!document.querySelector('#file-card-styles')) {
    const style = document.createElement('style');
    style.id = 'file-card-styles';
    style.textContent = `
        .file-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            backdrop-filter: blur(20px);
            transition: all var(--transition-base);
        }
        
        .file-card:hover {
            transform: translateY(-4px);
            border-color: var(--color-border-light);
            box-shadow: var(--shadow-lg);
        }
        
        .file-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-md);
            border-bottom: 1px solid var(--color-border);
        }
        
        .file-card-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            flex: 1;
        }
        
        .file-icon {
            width: 40px;
            height: 40px;
            color: var(--color-primary);
            flex-shrink: 0;
        }
        
        .file-card-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .file-card-name {
            color: var(--color-text-primary);
            font-weight: 600;
            font-size: 0.95rem;
            word-break: break-word;
        }
        
        .file-card-size {
            color: var(--color-text-secondary);
            font-size: 0.875rem;
        }
        
        .remove-file-btn {
            background: transparent;
            border: none;
            color: var(--color-text-tertiary);
            cursor: pointer;
            padding: var(--spacing-xs);
            transition: all var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .remove-file-btn:hover {
            color: #ef4444;
            transform: scale(1.1);
        }
        
        .remove-file-btn svg {
            width: 20px;
            height: 20px;
        }
        
        .file-card-body {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }
        
        .file-download-btn {
            width: 100%;
            padding: var(--spacing-md);
            background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
            color: white;
            border: none;
            border-radius: var(--radius-md);
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-base);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
        }
        
        .file-download-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
        }
        
        .file-download-btn svg {
            width: 18px;
            height: 18px;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Podcast Rendering
// ============================================

function formatEpisodeDate(isoDate) {
    if (!isoDate) return '';
    try {
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    } catch (error) {
        return '';
    }
}

function renderPodcastEmpty(message) {
    if (!podcastList) return;
    podcastList.innerHTML = `
        <div class="podcast-empty">
            <div class="podcast-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
            </div>
            <p>${message}</p>
        </div>
    `;
}

function renderPodcastEpisodes(episodes) {
    if (!podcastList) return;

    podcastList.innerHTML = '';

    if (!episodes || episodes.length === 0) {
        renderPodcastEmpty('등록된 팟캐스트가 아직 없습니다. 관리자 페이지에서 새로운 에피소드를 업로드해주세요.');
        return;
    }

    episodes.forEach((episode) => {
        const card = document.createElement('article');
        card.className = 'podcast-card reveal';

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'none';
        audio.setAttribute('controlslist', 'nodownload noplaybackrate');
        audio.setAttribute('disablepictureinpicture', '');
        audio.dataset.episodeId = episode.id;

        const source = document.createElement('source');
        source.src = episode.audioUrl;
        source.type = episode.contentType || 'audio/mpeg';
        audio.appendChild(source);

        audio.appendChild(document.createTextNode('브라우저가 오디오 태그를 지원하지 않습니다.'));

        card.innerHTML = `
            <header class="podcast-card-header">
                <div class="podcast-card-meta">
                    <span class="podcast-card-title">${episode.title}</span>
                    <span class="podcast-card-date">${formatEpisodeDate(episode.createdAt)}</span>
                </div>
            </header>
            <p class="podcast-card-description">${episode.description}</p>
        `;

        card.appendChild(audio);
        podcastList.appendChild(card);
        if (typeof revealObserver !== 'undefined') {
            revealObserver.observe(card);
        }
    });
}

async function loadPodcasts() {
    if (!podcastList) return;

    renderPodcastEmpty('팟캐스트 목록을 불러오는 중입니다...');

    try {
        const response = await fetch('/api/listPodcasts');
        if (!response.ok) {
            throw new Error('팟캐스트 목록을 불러오지 못했습니다.');
        }
        const { episodes } = await response.json();
        renderPodcastEpisodes(episodes);
    } catch (error) {
        console.error('[podcast] load failed:', error);
        renderPodcastEmpty('팟캐스트 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도하거나 관리자 페이지에서 구성을 확인해주세요.');
    }
}

// ============================================
// Board Rendering & Interactions
// ============================================

let boardPostsCache = [];
let currentBoardPostId = null;
let boardActiveFilter = 'all';
let boardSearchTerm = '';

function formatBoardDate(isoDate) {
    try {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (error) {
        return '';
    }
}

function formatBoardListDate(isoDate) {
    try {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    } catch (error) {
        return '';
    }
}

function escapeHtml(value) {
    if (!value) return '';
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatBoardContent(content) {
    return escapeHtml(content).replace(/\n/g, '<br>');
}

function normalizeViews(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function updateBoardSummary() {
    if (!boardTotalCount || !boardNewCount || !boardViewCount) return;
    const totalCount = boardPostsCache.length;
    const newCount = boardPostsCache.filter((post) => post.isNew).length;
    const totalViews = boardPostsCache.reduce((sum, post) => sum + normalizeViews(post.views), 0);

    boardTotalCount.textContent = totalCount.toLocaleString('ko-KR');
    boardNewCount.textContent = newCount.toLocaleString('ko-KR');
    boardViewCount.textContent = totalViews.toLocaleString('ko-KR');
}

function renderBoardListEmpty(message) {
    if (!boardTableBody) return;
    boardTableBody.innerHTML = `
        <tr class="board-table-empty">
            <td colspan="5">
                <div class="board-empty">
                    <div class="board-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19h16M4 5h16M5 5l2 14m10-14l2 14M9 5v14m6-14v14"></path>
                        </svg>
                    </div>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
}

function setBoardDetailLoading() {
    if (!boardDetailContainer) return;
    boardDetailContainer.classList.remove('board-detail-empty');
    boardDetailContainer.innerHTML = `
        <div class="board-detail-loading">
            <div class="loading-spinner"></div>
            <p>게시글을 불러오는 중입니다...</p>
        </div>
    `;
}

function renderBoardError(message) {
    if (!boardDetailContainer) return;
    boardDetailContainer.classList.remove('board-detail-empty');
    boardDetailContainer.innerHTML = `
        <div class="board-detail-error">
            <div class="board-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <p>${message}</p>
        </div>
    `;
}

function buildCommentsTree(comments = []) {
    const nodes = new Map();
    comments.forEach((comment) => {
        nodes.set(comment.id, { ...comment, children: [] });
    });
    const roots = [];
    nodes.forEach((node) => {
        if (node.parentId && nodes.has(node.parentId)) {
            nodes.get(node.parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });
    const sortByDate = (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    const sortTree = (items) => {
        items.sort(sortByDate);
        items.forEach((item) => sortTree(item.children));
    };
    sortTree(roots);
    return roots;
}

function renderCommentNode(comment) {
    const children = comment.children && comment.children.length
        ? `<ul class="board-comment-children">${comment.children.map(renderCommentNode).join('')}</ul>`
        : '';

    return `
        <li class="board-comment" data-comment-id="${comment.id}">
            <div class="board-comment-body">
                <div class="board-comment-meta">
                    <span class="board-comment-author">관리자</span>
                    <time>${formatBoardDate(comment.createdAt)}</time>
                </div>
                <p class="board-comment-content">${formatBoardContent(comment.content)}</p>
                <div class="board-comment-actions">
                    <button type="button" class="board-reply-button" data-comment-id="${comment.id}">답글 작성</button>
                </div>
                <div class="board-reply-placeholder" data-parent-id="${comment.id}"></div>
            </div>
            ${children}
        </li>
    `;
}

function renderBoardDetail(post, comments = []) {
    if (!boardDetailContainer) return;

    boardDetailContainer.classList.remove('board-detail-empty');

    const hasImages = Array.isArray(post.images) && post.images.length > 0;
    const hasLinks = Array.isArray(post.links) && post.links.length > 0;
    const commentTree = buildCommentsTree(comments);
    const authorLabel = escapeHtml(post.author || '관리자');
    const viewCount = normalizeViews(post.views).toLocaleString('ko-KR');

    boardDetailContainer.innerHTML = `
        <article class="board-article">
            <header class="board-detail-header">
                <div>
                    <h3 id="boardModalTitle" class="board-detail-title">${escapeHtml(post.title)}</h3>
                    <div class="board-detail-meta">
                        <span class="board-detail-author">${authorLabel}</span>
                        <time>${formatBoardDate(post.createdAt)}</time>
                        ${post.updatedAt && post.updatedAt !== post.createdAt ? `<span class="board-detail-updated">업데이트: ${formatBoardDate(post.updatedAt)}</span>` : ''}
                        <span class="board-detail-views">조회 ${viewCount}</span>
                    </div>
                </div>
            </header>
            ${post.summary ? `<p class="board-detail-summary">${escapeHtml(post.summary)}</p>` : ''}
            <div class="board-detail-content">${formatBoardContent(post.content)}</div>

            ${(hasImages || hasLinks) ? `
                <section class="board-detail-attachments">
                    ${hasImages ? `
                        <div class="board-detail-images">
                            <h4>이미지</h4>
                            <div class="board-image-grid">
                                ${post.images.map((image) => `
                                    <figure class="board-image-item">
                                        <img src="${image.url}" alt="${escapeHtml(image.name || '첨부 이미지')}" loading="lazy">
                                    </figure>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${hasLinks ? `
                        <div class="board-detail-links">
                            <h4>관련 링크</h4>
                            <ul>
                                ${post.links.map((link) => `
                                    <li>
                                        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                                            ${escapeHtml(link.label || link.url)}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </section>
            ` : ''}

            <section class="board-comments">
                <div class="board-comments-header">
                    <h4>댓글</h4>
                    <p class="board-comment-helper">댓글 작성은 관리자 전용입니다.</p>
                </div>
                ${commentTree.length
                    ? `<ul class="board-comment-list">${commentTree.map(renderCommentNode).join('')}</ul>`
                    : '<p class="board-comment-empty">첫 번째 댓글을 남겨주세요.</p>'}
                <form class="board-comment-form" data-post-id="${post.id}">
                    <label class="board-form-label" for="boardCommentContent">댓글 내용</label>
                    <textarea id="boardCommentContent" name="comment" class="board-form-textarea" placeholder="댓글 내용을 입력하세요." required></textarea>
                    <label class="board-form-label" for="boardCommentPassword">관리자 비밀번호</label>
                    <input id="boardCommentPassword" name="password" type="password" class="board-form-input" placeholder="비밀번호" required>
                    <button type="submit" class="board-form-submit">댓글 등록</button>
                </form>
            </section>
        </article>
    `;
    boardDetailContainer.scrollTop = 0;
}

function updateBoardRow(post) {
    if (!boardTableBody) return;
    const views = normalizeViews(post.views);
    boardPostsCache = boardPostsCache.map((item) => (
        item.id === post.id ? { ...item, views } : item
    ));
    updateBoardSummary();
    highlightActiveBoardItem(currentBoardPostId);
}

function highlightActiveBoardItem(postId) {
    if (!boardTableBody) return;
    boardTableBody.querySelectorAll('tr.board-row').forEach((row) => {
        const isActive = postId && row.dataset.id === postId;
        row.classList.toggle('active', isActive);
        row.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
}

function resetBoardDetailPlaceholder() {
    if (!boardDetailContainer) return;
    boardDetailContainer.classList.add('board-detail-empty');
    boardDetailContainer.innerHTML = `
        <div class="board-detail-placeholder">
            <h3>게시글을 선택해주세요</h3>
            <p>목록에서 게시글을 선택하면 제목, 본문, 첨부 자료와 댓글을 확인할 수 있습니다.</p>
        </div>
    `;
}

function renderBoardList(posts) {
    if (!boardTableBody) return;

    if (!posts || posts.length === 0) {
        renderBoardListEmpty('조건에 맞는 게시글이 없습니다.');
        highlightActiveBoardItem(null);
        return;
    }

    const rowsMarkup = posts.map((post) => {
        const isActive = post.id === currentBoardPostId;
        const views = normalizeViews(post.views).toLocaleString('ko-KR');
        const summary = post.summary ? `<span class="board-table-summary">${escapeHtml(post.summary)}</span>` : '';

        return `
            <tr class="board-row${isActive ? ' active' : ''}" data-id="${post.id}" aria-selected="${isActive ? 'true' : 'false'}" tabindex="0">
                <td class="board-cell-number">#${post.number}</td>
                <td class="board-cell-title">
                    <span class="board-cell-title-text">${escapeHtml(post.title)}</span>
                    ${post.isNew ? '<span class="board-badge board-badge--inline">New</span>' : ''}
                    ${summary}
                </td>
                <td class="board-cell-author">${escapeHtml(post.author || '관리자')}</td>
                <td class="board-cell-date">${formatBoardListDate(post.createdAt)}</td>
                <td class="board-cell-views">${views}</td>
            </tr>
        `;
    }).join('');

    boardTableBody.innerHTML = rowsMarkup;
}

function applyBoardFilters({ maintainSelection = true } = {}) {
    let filtered = [...boardPostsCache];

    if (boardActiveFilter === 'new') {
        filtered = filtered.filter((post) => post.isNew);
    }

    if (boardSearchTerm) {
        const term = boardSearchTerm;
        filtered = filtered.filter((post) => {
            const values = [
                post.title,
                post.summary,
                post.author,
            ].filter(Boolean).join(' ').toLowerCase();
            return values.includes(term);
        });
    }

    if (filtered.length === 0) {
        const emptyMessage = boardPostsCache.length === 0
            ? '등록된 게시글이 아직 없습니다. 관리자 페이지에서 새로운 글을 등록해주세요.'
            : '조건에 맞는 게시글이 없습니다.';
        renderBoardListEmpty(emptyMessage);
        currentBoardPostId = null;
        resetBoardDetailPlaceholder();
        return;
    }

    renderBoardList(filtered);

    if (maintainSelection && currentBoardPostId && filtered.some((post) => post.id === currentBoardPostId)) {
        highlightActiveBoardItem(currentBoardPostId);
        return;
    }

    currentBoardPostId = filtered[0]?.id || null;

    if (currentBoardPostId) {
        highlightActiveBoardItem(currentBoardPostId);
        fetchBoardDetail(currentBoardPostId, { preserveSelection: true });
    } else {
        resetBoardDetailPlaceholder();
    }
}

async function fetchBoardDetail(postId, { preserveSelection = false } = {}) {
    if (!postId) return;

    if (!preserveSelection) {
        currentBoardPostId = postId;
    }
    highlightActiveBoardItem(postId);
    setBoardDetailLoading();

    try {
        const response = await fetch(`/api/getBoardPost?id=${encodeURIComponent(postId)}`);
        if (!response.ok) {
            throw new Error('게시글을 불러오지 못했습니다.');
        }
        const data = await response.json();
        updateBoardRow(data.post);
        renderBoardDetail(data.post, data.comments);
        highlightActiveBoardItem(postId);
    } catch (error) {
        console.error('[board] detail load failed:', error);
        renderBoardError(error.message || '게시글을 불러오는 데 실패했습니다.');
    }
}

async function loadBoardPosts() {
    if (!boardTableBody) return;

    renderBoardListEmpty('게시글 목록을 불러오는 중입니다...');

    try {
        const response = await fetch('/api/listBoardPosts');
        if (!response.ok) {
            throw new Error('게시글 목록을 불러오지 못했습니다.');
        }
        const { posts } = await response.json();
        boardPostsCache = posts;
        updateBoardSummary();
        currentBoardPostId = null;
        resetBoardDetailPlaceholder();
        applyBoardFilters({ maintainSelection: false });
    } catch (error) {
        console.error('[board] list load failed:', error);
        renderBoardListEmpty('게시글 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
        renderBoardError('게시글 목록을 불러오는 데 실패했습니다.');
    }
}

async function submitBoardComment({ postId, content, password, parentId = null }) {
    const response = await fetch('/api/addBoardComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content, password, parentId }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || '댓글 등록에 실패했습니다.');
    }

    return result.comment;
}

if (boardDetailContainer) {
    boardDetailContainer.addEventListener('click', (event) => {
        const replyButton = event.target.closest('.board-reply-button');
        if (!replyButton) return;

        const commentId = replyButton.dataset.commentId;
        const placeholder = boardDetailContainer.querySelector(`.board-reply-placeholder[data-parent-id="${commentId}"]`);
        if (!placeholder) return;

        const existingForm = placeholder.querySelector('.board-reply-form');
        if (existingForm) {
            placeholder.innerHTML = '';
            return;
        }

        const form = document.createElement('form');
        form.className = 'board-reply-form';
        form.dataset.postId = currentBoardPostId || '';
        form.dataset.parentId = commentId;
        form.innerHTML = `
            <label class="board-form-label">답글 내용</label>
            <textarea name="comment" class="board-form-textarea" rows="3" placeholder="답글 내용을 입력하세요." required></textarea>
            <label class="board-form-label">관리자 비밀번호</label>
            <input name="password" type="password" class="board-form-input" placeholder="비밀번호" required>
            <div class="board-reply-actions">
                <button type="submit" class="board-form-submit">답글 등록</button>
                <button type="button" class="board-reply-cancel">취소</button>
            </div>
        `;

        placeholder.innerHTML = '';
        placeholder.appendChild(form);
    });

    boardDetailContainer.addEventListener('click', (event) => {
        const cancelButton = event.target.closest('.board-reply-cancel');
        if (!cancelButton) return;
        const form = cancelButton.closest('.board-reply-form');
        if (form && form.parentElement) {
            form.parentElement.innerHTML = '';
        }
    });

    boardDetailContainer.addEventListener('submit', async (event) => {
        const form = event.target;

        if (!form.classList.contains('board-comment-form') && !form.classList.contains('board-reply-form')) {
            return;
        }

        event.preventDefault();

        const postId = form.dataset.postId || currentBoardPostId;
        const parentId = form.dataset.parentId || null;
        const contentField = form.querySelector('textarea[name="comment"]');
        const passwordField = form.querySelector('input[name="password"]');

        if (!contentField || !passwordField) {
            showNotification('폼 구성이 올바르지 않습니다.', 'error');
            return;
        }

        const content = contentField.value.trim();
        const password = passwordField.value.trim();

        if (content.length < 2) {
            showNotification('댓글 내용을 2글자 이상 입력해주세요.', 'error');
            return;
        }

        if (!password) {
            showNotification('관리자 비밀번호를 입력해주세요.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '등록 중...';
        }

        try {
            await submitBoardComment({ postId, content, password, parentId });
            showNotification('댓글이 등록되었습니다.', 'success');
            contentField.value = '';
            passwordField.value = '';
            if (form.classList.contains('board-reply-form') && form.parentElement) {
                form.parentElement.innerHTML = '';
            }
            fetchBoardDetail(postId, { preserveSelection: true });
        } catch (error) {
            console.error('[board] comment submit failed:', error);
            showNotification(error.message || '댓글 등록에 실패했습니다.', 'error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = form.classList.contains('board-reply-form') ? '답글 등록' : '댓글 등록';
            }
        }
    });
}

if (boardTableBody) {
    boardTableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr.board-row');
        if (!row) return;
        const postId = row.dataset.id;
        if (!postId || postId === currentBoardPostId) return;
        fetchBoardDetail(postId);
    });

    boardTableBody.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const row = event.target.closest('tr.board-row');
        if (!row) return;
        const postId = row.dataset.id;
        if (!postId || postId === currentBoardPostId) return;
        event.preventDefault();
        fetchBoardDetail(postId);
    });
}

if (boardSearchInput) {
    boardSearchInput.addEventListener('input', (event) => {
        boardSearchTerm = event.target.value.trim().toLowerCase();
        applyBoardFilters();
    });
}

if (boardFilterButtons.length) {
    boardFilterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;
            boardFilterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            boardActiveFilter = button.dataset.filter || 'all';
            applyBoardFilters({ maintainSelection: false });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadPodcasts();
    loadBoardPosts();
});
