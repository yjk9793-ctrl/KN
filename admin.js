const uploadForm = document.getElementById('podcastUploadForm');
const statusBox = document.getElementById('uploadStatus');
const titleInput = document.getElementById('episodeTitle');
const descriptionInput = document.getElementById('episodeDescription');
const fileInput = document.getElementById('episodeFile');

let uploading = false;

async function parseJsonResponse(response) {
    const raw = await response.text();
    if (!raw) {
        return {};
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('[admin] Failed to parse JSON response:', error.message);
        return {};
    }
}

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

        const result = await parseJsonResponse(response);

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

if (uploadForm) {
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const file = fileInput.files[0];

        if (!title || title.length < 2) {
            setStatus(statusBox, '에피소드 제목을 2글자 이상 입력해주세요.', 'error');
            return;
        }

        if (!description || description.length < 5) {
            setStatus(statusBox, '에피소드 소개를 5글자 이상 입력해주세요.', 'error');
            return;
        }

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
