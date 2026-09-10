# WinterLog

학습 기록을 공유하고 서로 질문·답변하는 React 기반 커뮤니티 웹앱입니다.

---

## 🌱 프로젝트 소개

학습 과정과 공부 기록을 남기고 다른 사용자와 공유하며, 서로 질문하고 답변할 수 있도록 만든 개인 프로젝트입니다.<br>
프론트엔드·JavaScript·React·AI 활용·오류 해결 기록 등 학습 카테고리와 상태 태그(질문·해결완료·회고 등)로 글을 정리하고 댓글로 소통합니다.<br>
데이터와 인증은 Supabase로 연결했고 GitHub Pages로 배포합니다.

---

## ✨ 주요 기능

- 이메일 회원가입 / 로그인 (Supabase 인증)
- 게시글 작성 · 조회 · 수정, 마크다운 작성 및 렌더링
- 댓글과 대댓글, 댓글 페이지네이션
- 정렬(최신순) · 카테고리 · 태그 필터, 키워드 검색
- 마이페이지 (내 정보 · 활동)
- 방명록
- 반응형 레이아웃

---

## 🛠 기술 스택

이 프로젝트에서 사용한 주요 기술입니다.

<img src="https://img.shields.io/badge/React-cfe8ff?style=flat-square&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/Vite-e6d6ff?style=flat-square&logo=vite&logoColor=black"/> <img src="https://img.shields.io/badge/MUI-bcd8ff?style=flat-square&logo=mui&logoColor=black"/> <img src="https://img.shields.io/badge/React%20Router-ffd8cc?style=flat-square&logo=reactrouter&logoColor=black"/> <img src="https://img.shields.io/badge/Supabase-cfeccf?style=flat-square&logo=supabase&logoColor=black"/>

- React · Vite · React Router (HashRouter)
- MUI · Emotion
- 상태 관리: Zustand
- 마크다운: react-markdown · remark-gfm
- Supabase (인증 · 게시글 · 댓글 · 방명록)
- 배포: GitHub Actions → GitHub Pages

---

## 🎯 구현 및 경험

- 게시글 목록의 정렬·카테고리·태그·검색 조건을 URL 쿼리로 관리해 상태와 링크가 일치하도록 구성
- 댓글을 대댓글까지 다루면서 깊이별 렌더링과 페이지네이션을 함께 처리
- 인증 상태를 Zustand로 관리하고 로그인이 필요한 화면(작성·수정·마이페이지)의 접근을 제어
- 마크다운 작성·렌더링을 적용해 코드와 정리한 내용을 함께 공유할 수 있도록 구성
- GitHub Pages의 SPA 라우팅 문제를 HashRouter로 처리

---

## 🚀 실행 / 배포

```bash
npm install
npm run dev
npm run build
```

환경 변수는 `.env` 에 설정합니다.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

`main` 브랜치에 push하면 GitHub Actions가 빌드 후 GitHub Pages로 배포합니다.

---

## 🔗 Links

- GitHub: https://github.com/Winter-Haeum/my-community
- Live: https://winter-haeum.github.io/my-community/
