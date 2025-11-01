// Vercel Serverless Function for sending emails to yjk9793@naver.com
// This uses EmailJS service (configured via environment variables or direct API call)

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, serviceType, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 방법 1: EmailJS를 통한 이메일 발송 (서버 사이드)
        // EmailJS API를 직접 호출
        const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
        const emailjsServiceId = process.env.EMAILJS_SERVICE_ID;
        const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID;

        if (emailjsPublicKey && emailjsServiceId && emailjsTemplateId) {
            const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;
            
            const emailData = {
                service_id: emailjsServiceId,
                template_id: emailjsTemplateId,
                user_id: emailjsPublicKey,
                template_params: {
                    to_email: 'yjk9793@naver.com',
                    from_name: name,
                    from_email: email,
                    service_type: serviceType || '일반 문의',
                    message: message,
                    subject: `[K&Partners 문의] ${serviceType || '일반 문의'} - ${name}`
                }
            };

            const response = await fetch(emailjsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                return res.status(200).json({ success: true, message: 'Email sent successfully' });
            } else {
                throw new Error('EmailJS API error');
            }
        }

        // 방법 2: 환경 변수가 설정되지 않은 경우
        // 실제 프로덕션에서는 이메일 서비스 설정 필요
        
        // 로그 출력 (Vercel 로그에서 확인 가능)
        console.log('Email request received:', {
            to: 'yjk9793@naver.com',
            subject: `[K&Partners 문의] ${serviceType || '일반 문의'} - ${name}`,
            body: `서비스 유형: ${serviceType || '일반 문의'}\n\n성명: ${name}\n이메일: ${email}\n\n문의 내용:\n${message}`
        });

        // 실제 이메일 발송을 위해서는 EmailJS 환경 변수 설정 필요
        // 또는 SendGrid, Mailgun 등의 이메일 서비스 사용
        
        return res.status(200).json({ 
            success: true, 
            message: 'Email request received',
            note: 'In production, configure email service (EmailJS, SendGrid, etc.)'
        });
        
    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ 
            error: 'Failed to send email', 
            message: error.message 
        });
    }
}
