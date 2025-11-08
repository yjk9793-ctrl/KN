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

## 게시판 & 댓글 관리

1. 동일한 `ADMIN_PASSWORD`와 `BLOB_READ_WRITE_TOKEN` 환경 변수를 사용합니다.
2. `admin.html` 로그인 후 탭에서 “게시글 작성”을 선택하면 게시글 등록 폼이 노출됩니다.
   - 제목, 작성자(기본값 ‘관리자’), 요약(선택), 본문, 링크(줄 단위), 이미지(최대 6MB 권장)를 입력하면 `/api/createBoardPost`를 통해 Vercel Blob에 저장됩니다.
   - 게시글 데이터는 `board/<postId>/post.json`, 댓글은 `board/<postId>/comments.json`, 첨부 이미지는 `board/<postId>/images/*` 경로에 저장됩니다.
3. 공개 사이트에서는 `/api/listBoardPosts`로 게시글 목록을, `/api/getBoardPost`로 상세 내용을 확인하며 최신 글은 72시간 동안 “New” 배지로 상단에 노출됩니다.
   - 목록은 번호/제목/글쓴이/날짜/조회수로 구성된 테이블 형태이며, 제목을 클릭하면 같은 페이지 하단 영역에서 본문·첨부·댓글을 바로 확인할 수 있습니다.
   - 상세 조회 시 조회수가 자동 증가하며 테이블에도 즉시 반영됩니다.
4. 댓글·대댓글 작성은 관리자 비밀번호가 필요한 `/api/addBoardComment` 경로를 이용합니다. 댓글은 트리 구조로 렌더링되며, 상세 화면에서 바로 입력할 수 있습니다.
5. Vercel Blob RW 토큰이 누락되면 게시글/댓글 저장이 실패하므로 배포 전 환경 변수를 반드시 설정하세요.
