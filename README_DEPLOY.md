# 빠른 배포 방법

## 자동 배포 (권장)

다음 3개 파일을 GitHub에 업데이트하세요:
1. `index.html` - 컨설턴트 섹션 포함
2. `styles.css` - 애니메이션 및 스타일 포함  
3. `vercel.json` - 캐시 설정 수정됨

## GitHub 웹에서 업로드

1. https://github.com/yjk9793-ctrl/KN 접속
2. 각 파일 클릭 → Edit (연필 아이콘)
3. 내용 복사/붙여넣기
4. Commit changes

## Vercel 자동 배포

GitHub 푸시 후 Vercel이 자동 배포합니다.
대시보드: https://vercel.com/dashboard

## 배포 확인

- 배포 완료 후 브라우저에서 하드 리프레시 (Cmd+Shift+R)
- 컨설턴트 섹션 확인
- 히어로 애니메이션 확인

## 팟캐스트 업로드 설정

1. Vercel 프로젝트 환경 변수에 다음 값을 추가합니다.
   - `ADMIN_PASSWORD`: 관리자 페이지(`admin.html`) 접속 시 사용할 비밀번호.
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob 스토리지 RW 토큰. `vercel storage tokens create <token-name>` 명령으로 생성 가능합니다.
2. 첫 배포 후 `https://<your-domain>/admin.html`에 접속해 비밀번호를 입력하면 업로드 폼이 노출됩니다.
3. 업로드 폼에서는 제목·소개·오디오 파일을 입력하여 `/api/uploadPodcast`로 전송합니다. 오디오는 Vercel Blob에 저장되고 메타데이터(`metadata.json`)가 함께 생성됩니다.
4. 공개 사이트(`index.html`)는 `/api/listPodcasts`를 통해 메타데이터를 불러와 오디오 플레이어를 렌더링합니다. `<audio>` 태그에 `controlslist="nodownload noplaybackrate"`와 `disablepictureinpicture`를 설정해 다운로드 버튼을 숨깁니다.
5. 대용량 파일은 업로드 전에 용량을 축소하거나 Vercel Blob의 업로드 URL 방식을 적용하도록 가이드를 추가해 주세요. (현재 구현은 약 10~12MB 이내에 최적화되어 있음)

> 참고: 업로드된 파일은 일반 공개 URL로 재생되므로 완전한 다운로드 차단은 기술적으로 어렵습니다. 위 설정으로 기본 다운로드 UI만 비활성화합니다.

