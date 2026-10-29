# Feedbuddi Saju (피드버디 사주)

생년월일시로 사주 차트를 계산하고, AI에게 풀이를 물어볼 수 있는 요청문을 만들어 주는 정적 웹사이트입니다.
계산은 모두 브라우저 안에서 이루어지며 생년월일은 서버로 전송하거나 저장하지 않습니다.

- 계산 엔진: [`@orrery/core`](https://github.com/rath/orrery) (AGPL-3.0)
- 라이선스: AGPL-3.0-only (`LICENSE` 참고) — 이 저장소의 소스는 누구나 볼 수 있습니다.

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 생성
```

## 배포 (Cloudflare)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (설정은 `wrangler.jsonc`, 결과물 폴더는 `dist`)
- Node 버전은 `.node-version`에 적혀 있습니다.
