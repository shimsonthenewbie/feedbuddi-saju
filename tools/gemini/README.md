# 제미나이 자동 작업 도구 (그림 · 번역)

제미나이 API(무료 키)로 **그림 73장**과 **글 번역**을 자동으로 만들어요.
한도에 걸리면 알아서 쉬었다가 다시 하고, 껐다 켜도 **이미 한 건 건너뛰고 이어서** 해요.

## 처음 한 번만
1. https://aistudio.google.com/apikey 에서 무료 키를 만들어요.
2. `tools/gemini/.env` 파일을 만들고 한 줄 적어요: `GEMINI_API_KEY=여기에키`  (이 파일은 깃에 올라가지 않아요)
3. Node 18 이상이 필요해요. 설치가 따로 필요 없어요.

## 그림 (램프 없이 짧은 꼬리와 발이 있는 용용이)
```
cd tools/gemini
# 1) 지금 용용이 그림을 ref/dragon-old.png 로 넣고, 새 용용이 후보 4장 만들기
node gen-images.mjs base
# 2) out/base 에서 마음에 드는 한 장을 ref/dragon-ref.png 로 복사
# 3) 나머지 73장 전부 만들기 (결과: out/images/*.png)
node gen-images.mjs
```
- 일부만: `node gen-images.mjs --only=pose,dragon-hello`  (묶음 이름이나 그림 이름)
- 어떤 문장이 나가는지만 보기: `--dry`
- 마음에 안 드는 그림은 `out/images` 에서 지우고 다시 실행하면 그것만 다시 만들어요.
- 한도가 막히면 "쉬었다가 자동으로 다시 해요"라고 나오고 기다려요. 하루 한도면 30분마다 확인해요(한국 시간 오후 4~5시쯤 풀려요).
- 무료 키로 그림 만들기가 막혀 있으면(한도 0) 모델을 바꿔 보세요: `IMAGE_MODEL=모델이름 node gen-images.mjs`
- 호출 간격은 기본 8초: `GAP_SEC=15 node gen-images.mjs`

## 번역 (점신 같은 쉬운 말투)
```
node translate.mjs              # 영어 → out/en/batch-*.json
node translate.mjs --lang=ja    # 일본어 (zh, es, fr, de, pt, id, th, vi, ru, ar, hi, tr 도 돼요)
```
- 결과마다 자동 검사해요: 개수, id, `${}` 자리, HTML 태그, 한글이 남았는지. 실패하면 4번까지 다시 해요.
- 글이 바뀌면 `node extract-strings.cjs` 로 `i18n/batch-*.json` 을 다시 뽑아요.

## VS Code 클로드에게 시킬 말
"tools/gemini/README.md 를 읽고, .env 에 키가 있는지 확인한 다음 base 부터 순서대로 실행해 줘. 후보가 나오면 알려 줘."

## 대안: 무료 키로 그림이 안 될 때
"쓸 수 있는 그림 모델이 없어요"가 나오면 무료 API 키에는 그림 만들기 사용량이 없는 거예요. 둘 중 하나로 가요.
1. **결제 수단을 붙인 키**: AI Studio에서 결제(Tier 1)를 켜면 그림 1장에 40~60원쯤이라, 73장이 4천 원 안팎이에요. 켠 뒤 같은 명령을 다시 실행하면 돼요.
2. **제미나이 앱·AI Studio 화면에서 손으로**: 이미 만들어 둔 주문서(`scratch` 의 그림 주문서)를 복사해 붙여 넣는 방법이에요. 번역(글)은 무료 키로도 돼요.

## 브라우저로 제미나이 화면을 조작해서 번역하기 (API 없이)
- 묶음은 40문장씩 123개로 다시 나눴어요(화면 채팅은 한 번에 긴 답을 못 주는 일이 있어서). 크기는 `N=60 node extract-strings.cjs` 로 바꿀 수 있어요.
- 지시문은 `translation-rules.mjs` 의 `systemPrompt('English')` 를 쓰고, 묶음 파일 내용을 그 아래에 붙여서 보내요.
- 받은 답(JSON 배열)을 `out/en/batch-000.json` 처럼 저장한 뒤 `node check-translations.mjs` 로 검사해요. 잘못된 묶음은 `--fix` 로 지우고 다시 받아요.
