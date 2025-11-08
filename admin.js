const loginForm = document.getElementById('adminLoginForm');
const passwordInput = document.getElementById('adminPassword');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('podcastUploadForm');
const statusBox = document.getElementById('uploadStatus');
const titleInput = document.getElementById('episodeTitle');
const descriptionInput = document.getElementById('episodeDescription');
const fileInput = document.getElementById('episodeFile');

let adminPassword = '';
let verifying = false;
let uploading = false;

function setStatus(message, type = 'info') {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = `admin-status admin-status--${type}`;
}

async function verifyPassword(password) {
    if (verifying) return;
    verifying = true;
    setStatus('비밀번호 확인 중...', 'info');

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

        setStatus('접속이 확인되었습니다. 팟캐스트를 업로드하세요.', 'success');
        uploadSection.classList.remove('admin-hidden');
        loginForm.classList.add('admin-hidden');
        adminPassword = password;
    } catch (error) {
        setStatus(error.message || '비밀번호 인증에 실패했습니다.', 'error');
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

        setStatus(`업로드가 완료되었습니다. (${result.episode.title})`, 'success');
        uploadForm.reset();
    } catch (error) {
        setStatus(error.message || '업로드 중 오류가 발생했습니다.', 'error');
    } finally {
        uploading = false;
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const password = passwordInput.value.trim();

        if (!password) {
            setStatus('비밀번호를 입력해주세요.', 'error');
            return;
        }

        verifyPassword(password);
    });
}

if (uploadForm) {
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!adminPassword) {
            setStatus('먼저 관리자 인증이 필요합니다.', 'error');
            return;
        }

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const file = fileInput.files[0];

        if (!file) {
            setStatus('오디오 파일을 선택해주세요.', 'error');
            return;
        }

        const maxSize = 12 * 1024 * 1024; // 12MB
        if (file.size > maxSize) {
            setStatus('파일 크기는 12MB 이하여야 합니다.', 'error');
            return;
        }

        setStatus('파일 처리 중...', 'info');
        try {
            const audioData = await fileToBase64(file);
            setStatus('업로드 중...', 'info');

            await uploadPodcast({
                password: adminPassword,
                title,
                description,
                fileName: file.name,
                contentType: file.type,
                audioData,
            });
        } catch (error) {
            setStatus(error.message || '파일 처리 중 문제가 발생했습니다.', 'error');
        }
    });
}

