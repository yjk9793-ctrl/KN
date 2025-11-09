const loginForm = document.getElementById('adminLoginForm');
const passwordInput = document.getElementById('adminPassword');
const tabsContainer = document.getElementById('adminTabs');
const tabButtons = tabsContainer ? Array.from(tabsContainer.querySelectorAll('.admin-tab')) : [];
const podcastPanel = document.getElementById('podcastPanel');
const boardPanel = document.getElementById('boardPanel');
const uploadForm = document.getElementById('podcastUploadForm');
const loginStatusBox = document.getElementById('loginStatus');
const statusBox = document.getElementById('uploadStatus');
const titleInput = document.getElementById('episodeTitle');
const descriptionInput = document.getElementById('episodeDescription');
const fileInput = document.getElementById('episodeFile');
const boardForm = document.getElementById('boardPostForm');
const boardStatusBox = document.getElementById('boardStatus');
const boardTitleInput = document.getElementById('boardTitle');
const boardAuthorInput = document.getElementById('boardAuthor');
const boardSummaryInput = document.getElementById('boardSummary');
const boardContentInput = document.getElementById('boardContent');
const boardLinksInput = document.getElementById('boardLinks');
const boardImagesInput = document.getElementById('boardImages');

let adminPassword = '';
let verifying = false;
let uploading = false;
let posting = false;

function setStatus(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.className = `admin-status admin-status--${type}`;
    element.classList.remove('admin-hidden');
}

function clearStatus(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'admin-status admin-hidden';
}

function activatePanel(targetId) {
    if (!tabsContainer) return;
    const panels = [
        { id: 'podcastPanel', element: podcastPanel },
        { id: 'boardPanel', element: boardPanel },
    ];

    panels.forEach(({ id, element }) => {
        if (!element) return;
        if (id === targetId) {
            element.classList.remove('admin-hidden');
        } else {
            element.classList.add('admin-hidden');
        }
    });

    tabButtons.forEach((button) => {
        if (button.dataset.target === targetId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

async function verifyPassword(password) {
    if (verifying) return;
    verifying = true;
    setStatus(loginStatusBox, '비밀번호 확인 중...', 'info');
    clearStatus(boardStatusBox);

    try {
        const response = await fetch('/api/uploadPodcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password, action: 'verify' }),
        });

        if (!response.ok) {
            throw new Error('비밀번호가 올바르지 않습니다.');
        }

        setStatus(loginStatusBox, '접속이 확인되었습니다. 원하는 작업을 선택하세요.', 'success');
        loginForm.classList.add('admin-hidden');
        adminPassword = password;

        if (tabsContainer) {
            tabsContainer.classList.remove('admin-hidden');
        }
        activatePanel('podcastPanel');
        clearStatus(loginStatusBox);
    } catch (error) {
        setStatus(loginStatusBox, error.message || '비밀번호 인증에 실패했습니다.', 'error');
        adminPassword = '';
    } finally {
        verifying = false;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                const base64 = result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('파일을 읽을 수 없습니다.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
        };
        reader.readAsDataURL(file);
    });
}

async function uploadPodcast(formData) {
    if (uploading) return;
    uploading = true;

    try {
        const response = await fetch('/api/uploadPodcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '업로드에 실패했습니다.');
        }

        setStatus(statusBox, `업로드가 완료되었습니다. (${result.episode.title})`, 'success');
        uploadForm.reset();
    } catch (error) {
        setStatus(statusBox, error.message || '업로드 중 오류가 발생했습니다.', 'error');
    } finally {
        uploading = false;
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const password = passwordInput.value.trim();

        if (!password) {
            setStatus(loginStatusBox, '비밀번호를 입력해주세요.', 'error');
            return;
        }

        verifyPassword(password);
    });
}

if (uploadForm) {
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!adminPassword) {
            setStatus(statusBox, '먼저 관리자 인증이 필요합니다.', 'error');
            return;
        }

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const file = fileInput.files[0];

        if (!file) {
            setStatus(statusBox, '오디오 파일을 선택해주세요.', 'error');
            return;
        }

        const maxSize = 12 * 1024 * 1024; // 12MB
        if (file.size > maxSize) {
            setStatus(statusBox, '파일 크기는 12MB 이하여야 합니다.', 'error');
            return;
        }

        setStatus(statusBox, '파일 처리 중...', 'info');
        try {
            const audioData = await fileToBase64(file);
            setStatus(statusBox, '업로드 중...', 'info');

            await uploadPodcast({
                password: adminPassword,
                title,
                description,
                fileName: file.name,
                contentType: file.type,
                audioData,
            });
        } catch (error) {
            setStatus(statusBox, error.message || '파일 처리 중 문제가 발생했습니다.', 'error');
        }
    });
}

if (tabsContainer && tabButtons.length) {
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            if (!target) return;
            activatePanel(target);
        });
    });
}

function parseLinksInput(raw) {
    if (!raw) return [];
    return raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [url, ...labelParts] = line.split(/\s+/);
            const label = labelParts.length > 0 ? labelParts.join(' ') : url;
            return { url, label };
        });
}

async function uploadBoardPost(formData) {
    if (posting) return;
    posting = true;

    try {
        const response = await fetch('/api/createBoardPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || '게시글 등록에 실패했습니다.');
        }

        setStatus(boardStatusBox, `게시글이 등록되었습니다. (${result.post.title})`, 'success');
        boardForm.reset();
    } catch (error) {
        setStatus(boardStatusBox, error.message || '게시글 등록 중 오류가 발생했습니다.', 'error');
    } finally {
        posting = false;
    }
}

if (boardForm) {
    boardForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!adminPassword) {
            setStatus(boardStatusBox, '먼저 관리자 인증이 필요합니다.', 'error');
            return;
        }

        const title = boardTitleInput.value.trim();
        const content = boardContentInput.value.trim();
        const author = boardAuthorInput ? boardAuthorInput.value.trim() : '';
        const summary = boardSummaryInput.value.trim();
        const rawLinks = boardLinksInput.value;
        const imageFiles = Array.from(boardImagesInput.files || []);

        if (title.length < 2) {
            setStatus(boardStatusBox, '제목을 2글자 이상 입력해주세요.', 'error');
            return;
        }

        if (content.length < 5) {
            setStatus(boardStatusBox, '본문을 5글자 이상 입력해주세요.', 'error');
            return;
        }

        for (const file of imageFiles) {
            if (file.size > 6 * 1024 * 1024) {
                setStatus(boardStatusBox, `${file.name} 파일 크기는 6MB 이하여야 합니다.`, 'error');
                return;
            }
        }

        setStatus(boardStatusBox, '게시글을 준비하는 중입니다...', 'info');

        try {
            const attachments = await Promise.all(
                imageFiles.map(async (file) => ({
                    name: file.name,
                    contentType: file.type,
                    data: await fileToBase64(file),
                }))
            );

            await uploadBoardPost({
                password: adminPassword,
                title,
                author,
                summary,
                content,
                links: parseLinksInput(rawLinks),
                images: attachments,
            });
        } catch (error) {
            setStatus(boardStatusBox, error.message || '이미지 처리 중 문제가 발생했습니다.', 'error');
        } finally {
            if (boardAuthorInput && !boardAuthorInput.value.trim()) {
                boardAuthorInput.value = '관리자';
            }
        }
    });
}
