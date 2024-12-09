const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// 메모리에 데이터 저장 (초기값 설정)
let currentData = {
    attentions: new Array(117).fill(0), // 117개의 0으로 초기화된 배열
    game_result: {
        image_base64: '', // 이미지 기본값 (빈 문자열)
    },
};

// 미들웨어 설정
app.use(cors()); // CORS 활성화
app.use(express.json({ limit: '10mb' })); // JSON 본문 크기 제한 (10MB)

// Rate Limiting 설정
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // IP당 100번 요청 제한
});
app.use(limiter);

// 기본 라우트
app.get('/', (req, res) => {
    res.send('Hello, the server is running without a database!');
});

// 데이터 갱신 API
app.post('/api/game-data', (req, res) => {
    const { attentions, game_result } = req.body;

    // 요청 데이터 로그 출력
    console.log('Received Data:', req.body);

    // 검증 로직
    if (!Array.isArray(attentions) || attentions.length !== 117 || 
        typeof game_result.image_base64 !== 'string') {
        console.log('Validation Failed:', {
            isArray: Array.isArray(attentions),
            length: attentions?.length,
            isString: typeof game_result.image_base64,
        });
        return res.status(400).json({ message: 'Invalid data format' });
    }

    // 메모리에 데이터 갱신
    currentData.attentions = attentions;
    currentData.game_result = game_result;

    console.log('Data Updated Successfully:', currentData);
    res.status(200).json({ message: 'Game data updated successfully!' });
});

// 최신 데이터 반환 API
app.get('/api/game-data', (req, res) => {
    res.status(200).json(currentData); // 메모리의 최신 데이터 반환
});

// 중앙화된 에러 처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
