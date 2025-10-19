// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // CTA button smooth scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const contactSection = document.querySelector('#contact');
            contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        // Validate form
        if (validateForm(formData)) {
            // Show success message
            showNotification('문의가 성공적으로 전송되었습니다! 빠른 시일 내에 연락드리겠습니다.', 'success');
            
            // Reset form
            contactForm.reset();
            
            // In a real application, you would send this data to a server
            console.log('Form Data:', formData);
        } else {
            showNotification('모든 필드를 올바르게 입력해주세요.', 'error');
        }
    });

    // Form validation
    function validateForm(data) {
        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            return false;
        }

        // Phone validation (Korean phone number format)
        const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
        if (!data.phone || !phoneRegex.test(data.phone)) {
            return false;
        }

        // Message validation
        if (!data.message || data.message.trim().length < 10) {
            return false;
        }

        return true;
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        if (value.length <= 3) {
            e.target.value = value;
        } else if (value.length <= 7) {
            e.target.value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            e.target.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            e.target.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
    });

    // Notification system
    function showNotification(message, type) {
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
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            font-weight: 500;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
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

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 5000);
    }

    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Add typing effect to hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        let index = 0;

        function typeWriter() {
            if (index < text.length) {
                heroSubtitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        }

        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }

    // Add counter animation to stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateCounter = (element) => {
        const target = element.textContent;
        const number = parseInt(target.replace(/[^0-9]/g, ''));
        const suffix = target.replace(/[0-9]/g, '');
        const duration = 2000;
        const increment = number / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < number) {
                element.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    };

    // Observe stat numbers
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });

    // PDF Upload and Download functionality
    const uploadArea = document.getElementById('uploadArea');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const filesList = document.getElementById('filesList');
    
    let uploadedFiles = []; // 여러 파일을 관리하는 배열

    // Click to upload
    uploadArea.addEventListener('click', () => {
        pdfFileInput.click();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.background = 'var(--bg-secondary)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--bg-tertiary)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.background = 'var(--bg-tertiary)';
        
        const files = Array.from(e.dataTransfer.files);
        handleFilesUpload(files);
    });

    // File input change
    pdfFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFilesUpload(files);
    });

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
                isPaid: false
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
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.dataset.fileId = fileData.id;
        
        fileCard.innerHTML = `
            <div class="file-card-header">
                <div class="file-card-info">
                    <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <div class="file-card-details">
                        <span class="file-card-name">${fileData.file.name}</span>
                        <span class="file-card-size">${formatFileSize(fileData.file.size)}</span>
                    </div>
                </div>
                <button class="remove-file-card-btn" onclick="removeFile(${fileData.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="file-card-body">
                <div class="price-info">
                    <span class="price-label">가격</span>
                    <span class="price-value">5,000원</span>
                </div>
                <button class="file-payment-btn" onclick="requestPaymentForFile(${fileData.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    결제하기
                </button>
                <button class="file-download-btn" onclick="downloadFile(${fileData.id})" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
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

    // Request payment for specific file
    window.requestPaymentForFile = async function(fileId) {
        const fileData = uploadedFiles.find(f => f.id === fileId);
        if (!fileData) {
            showNotification('파일을 찾을 수 없습니다.', 'error');
            return;
        }

        // 토스페이먼츠 초기화 (테스트용 키)
        const tossPayments = TossPayments('test_ck_xxxxx'); // 테스트용 키

        try {
            showNotification('결제를 진행합니다...', 'success');

            // 결제 요청
            await tossPayments.requestPayment('카드', {
                amount: 5000,
                orderId: 'order_' + fileId,
                orderName: fileData.file.name,
                customerName: '구매자',
                successUrl: window.location.href + `?success=true&fileId=${fileId}`,
                failUrl: window.location.href + `?fail=true&fileId=${fileId}`,
            });
        } catch (err) {
            showNotification('결제 중 오류가 발생했습니다.', 'error');
            console.log('에러:', err);
        }
    };

    // Download file
    window.downloadFile = function(fileId) {
        const fileData = uploadedFiles.find(f => f.id === fileId);
        if (!fileData) {
            showNotification('파일을 찾을 수 없습니다.', 'error');
            return;
        }

        if (!fileData.isPaid) {
            showNotification('먼저 결제를 완료해주세요.', 'error');
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

    // 페이지 로드 시 결제 성공 여부 확인
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            const fileId = parseFloat(urlParams.get('fileId'));
            const fileData = uploadedFiles.find(f => f.id === fileId);
            
            if (fileData) {
                fileData.isPaid = true;
                const fileCard = document.querySelector(`[data-file-id="${fileId}"]`);
                if (fileCard) {
                    const paymentBtn = fileCard.querySelector('.file-payment-btn');
                    const downloadBtn = fileCard.querySelector('.file-download-btn');
                    paymentBtn.style.display = 'none';
                    downloadBtn.style.display = 'flex';
                }
                showNotification('결제가 완료되었습니다! 이제 다운로드가 가능합니다.', 'success');
            }
        } else if (urlParams.get('fail') === 'true') {
            showNotification('결제에 실패했습니다.', 'error');
        }
    });
});

