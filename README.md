# K&Partners - Your Starting Partner

K&Partners는 취업, 이직, 창업 컨설팅 서비스를 제공하는 전문 웹사이트입니다.

## 🎨 디자인 특징

- **다크 테마**: 현대적이고 전문적인 다크 컬러 스킴
- **그라데이션 효과**: 보라색과 인디고 계열의 그라데이션으로 시각적 매력 강화
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 완벽하게 작동
- **부드러운 애니메이션**: 스크롤 애니메이션과 호버 효과로 사용자 경험 향상

## 🚀 주요 기능

### 1. 히어로 섹션
- 중앙에 회사 이름 "K&Partners" 표시
- "Your Starting Partner" 서브타이틀
- 그라데이션 배경과 그리드 패턴
- 스크롤 인디케이터

### 2. 서비스 섹션
- **취업 컨설팅**: 이력서 작성, 면접 준비, 포트폴리오 구성
- **이직 컨설팅**: 이직 전략, 연봉 협상, 업계 트렌드 분석
- **창업 컨설팅**: 사업계획서 작성, 자금 조달, 시장 분석

### 3. 회사 소개 섹션
- K&Partners에 대한 소개
- 성공 사례, 만족도, 경력 연수 통계

### 4. PDF 업로드 및 결제 다운로드
- PDF 파일 업로드 (드래그 앤 드롭 지원)
- 토스페이먼츠(Toss Payments) 결제 시스템 연동
- 결제 후 즉시 다운로드
- 파일 크기 제한 (10MB)
- PDF 파일만 허용

### 5. 고객 문의 섹션
- 성명, 이메일, 전화번호, 문의 내용 입력 필드
- 실시간 폼 유효성 검사
- 전화번호 자동 포맷팅
- 성공/에러 알림 시스템

## 📁 파일 구조

```
KN/
├── index.html      # 메인 HTML 파일
├── styles.css      # 스타일시트
├── script.js       # JavaScript 기능
└── README.md       # 프로젝트 설명서
```

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 
  - CSS Grid & Flexbox
  - CSS Variables (Custom Properties)
  - Keyframe Animations
  - Gradient Effects
- **JavaScript (Vanilla)**:
  - DOM 조작
  - Intersection Observer API
  - Form Validation
  - Smooth Scrolling
  - Event Handling

## 🎯 실행 방법

### 방법 1: 직접 브라우저에서 열기
1. `index.html` 파일을 더블클릭하여 브라우저에서 열기

### 방법 2: 로컬 서버 실행 (권장)
```bash
# Python 3이 설치된 경우
python -m http.server 8000

# 또는 Node.js가 설치된 경우
npx http-server

# 또는 PHP가 설치된 경우
php -S localhost:8000
```

그 다음 브라우저에서 `http://localhost:8000` 접속

## ✨ 주요 기능 상세

### 네비게이션
- 고정형 네비게이션 바
- 부드러운 스크롤 이동
- 모바일 반응형 햄버거 메뉴
- 호버 시 언더라인 애니메이션

### 인터랙티브 요소
- 카드 호버 시 3D 효과
- 스크롤 시 페이드인 애니메이션
- 통계 숫자 카운터 애니메이션
- 타이핑 효과 (히어로 서브타이틀)

### 폼 기능
- 실시간 입력 검증
- 전화번호 자동 포맷팅 (010-1234-5678)
- 이메일 형식 검증
- 최소 글자 수 검증
- 성공/실패 알림 표시

## 🎨 컬러 팔레트

- **Primary**: `#6366f1` (인디고)
- **Secondary**: `#8b5cf6` (보라)
- **Accent**: `#f59e0b` (오렌지)
- **Background**: `#0f172a` (다크 블루)
- **Text**: `#e5e7eb` (라이트 그레이)

## 📱 반응형 브레이크포인트

- **Desktop**: 1200px 이상
- **Tablet**: 768px - 1199px
- **Mobile**: 767px 이하

## 🔧 커스터마이징

### 색상 변경
`styles.css` 파일의 `:root` 섹션에서 CSS 변수를 수정하세요:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* 원하는 색상으로 변경 */
}
```

### 텍스트 수정
`index.html` 파일에서 직접 텍스트를 수정할 수 있습니다.

## 💳 토스페이먼츠(Toss Payments) 결제 시스템 설정

### 1. 토스페이먼츠 가입 및 클라이언트 키 발급

1. [토스페이먼츠 홈페이지](https://developers.tosspayments.com/)에 접속
2. 무료 회원가입 (이메일 또는 전화번호)
3. 내 프로젝트 → 새 프로젝트 만들기
4. 프로젝트 설정 → **클라이언트 키** 복사
5. `script.js` 파일 422번째 줄 수정:

```javascript
const tossPayments = TossPayments('test_ck_YOUR_KEY_HERE'); // 본인의 클라이언트 키로 변경
```

### 2. 테스트 결제 (매우 간단!)

토스페이먼츠는 완벽한 테스트 모드를 제공합니다:

**테스트 카드 정보:**
- 카드번호: `1234-5678-9012-3456`
- 유효기간: `12/34`
- CVC: `123`
- 비밀번호: `123456`

**다른 테스트 카드:**
- ✅ 성공: `1234-5678-9012-3456`
- ❌ 실패: `4000-0000-0000-0002`
- 🔒 3D Secure: `4000-0025-0000-3155`

### 3. 토스페이먼츠의 장점

✅ **한국 최고의 결제 시스템** - 가장 많이 사용됨
✅ **매우 간단한 설정** - 3분이면 완료
✅ **완벽한 테스트 모드** - 실제 결제 없이 테스트 가능
✅ **한국 카드 전부 지원** - 삼성카드, 신한카드, KB카드 등
✅ **무료로 시작** - 거래 수수료만 지불 (3.6% + 100원)
✅ **우수한 한국어 문서** - 매우 친절한 가이드
✅ **빠른 승인** - 1-2일이면 승인 완료
✅ **다양한 결제 수단** - 카드, 계좌이체, 가상계좌, 휴대폰 소액결제

### 4. 실제 운영 시 설정

⚠️ **중요**: 실제 운영 시에는 다음 사항을 구현해야 합니다:

1. **서버 사이드 결제 검증** (필수)
2. **결제 정보 데이터베이스 저장**
3. **환불 처리 기능**
4. **웹훅(Webhook) 설정** - 결제 완료 알림
5. **HTTPS 필수**

### 5. 서버 사이드 구현 예시 (Node.js)

```javascript
// server.js
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 결제 검증
app.post('/verify-payment', async (req, res) => {
    const { orderId, amount, paymentKey } = req.body;
    
    // 토스페이먼츠 API로 결제 검증
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from('test_sk_xxx:').toString('base64'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paymentKey,
            orderId,
            amount
        })
    });
    
    const result = await response.json();
    
    if (result.status === 'DONE') {
        // 결제 성공
        res.json({ success: true, payment: result });
    } else {
        // 결제 실패
        res.json({ success: false, error: result.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 6. 클라이언트에서 서버 호출

```javascript
// script.js 수정
async function requestPayment() {
    const tossPayments = TossPayments('test_ck_YOUR_KEY');
    
    try {
        await tossPayments.requestPayment('카드', {
            amount: 5000,
            orderId: 'order_' + new Date().getTime(),
            orderName: uploadedPdfFile.name,
            customerName: '구매자',
            successUrl: 'http://localhost:3000/verify-payment',
            failUrl: 'http://localhost:3000/payment-fail',
        });
    } catch (err) {
        console.error('Error:', err);
    }
}
```

### 7. 웹훅(Webhook) 설정

실제 운영 시 결제 완료 알림을 받으려면:

```javascript
// server.js
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const signature = req.headers['x-toss-signature'];
    const webhookSecret = 'YOUR_WEBHOOK_SECRET';
    
    const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('base64');
    
    if (signature === hash) {
        // 웹훅 검증 성공
        const event = req.body;
        
        if (event.type === 'PAYMENT_CONFIRMED') {
            // 결제 완료 처리
            console.log('결제 완료:', event.data);
        }
        
        res.json({ received: true });
    } else {
        res.status(400).json({ error: 'Invalid signature' });
    }
});
```

## 📞 연락처 정보

웹사이트에 표시된 연락처 정보는 예시입니다. 실제 정보로 변경하세요:

- **이메일**: contact@kpartner.co.kr
- **전화**: 02-1234-5678
- **주소**: 서울특별시 강남구 테헤란로 123

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

버그 리포트나 기능 제안은 언제든지 환영합니다!

---

**K&Partners** - Your Starting Partner 🚀

