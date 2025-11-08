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

function renderPodcastEpisodes(episodes) {
    if (!podcastList) return;

    podcastList.innerHTML = '';

    if (!episodes || episodes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'podcast-empty';
        emptyState.innerHTML = `
            <div class="podcast-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
            </div>
            <p>곧 새로운 에피소드가 올라올 예정입니다.</p>
        `;
        podcastList.appendChild(emptyState);
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

    try {
        const response = await fetch('/api/listPodcasts');
        if (!response.ok) {
            throw new Error('팟캐스트 목록을 불러오지 못했습니다.');
        }
        const { episodes } = await response.json();
        renderPodcastEpisodes(episodes);
    } catch (error) {
        console.error('[podcast] load failed:', error);
        renderPodcastEpisodes([]);
    }
}

document.addEventListener('DOMContentLoaded', loadPodcasts);
