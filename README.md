# Red Heart (TypeScript + Vite + Canvas)

간단한 TypeScript + Vite 프로젝트로, 캔버스에 빨간 하트를 그리고 심장 박동 애니메이션을 보여줍니다.

## 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 브라우저에서 열기

터미널에 표시된 로컬 주소(예: http://localhost:5173)를 열어 하트를 확인하세요.

## 파일 구조

- `index.html`: 캔버스와 간단한 컨트롤 UI
- `src/main.ts`: 하트 그리기 및 애니메이션 로직
- `tsconfig.json`: TypeScript 컴파일 설정
- `package.json`: 스크립트 및 개발 의존성(Vite, TypeScript)

## 컨트롤

- Beat: 하트의 박동 강도(0~2)
- Glow: 하트 주위 발광 강도(0~1)

즐겁게 커스터마이즈해보세요!
