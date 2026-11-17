#!/bin/bash
# 글 번역 자동 만들기 — 더블클릭하면 Terminal에서 돌아가요. 멈추면 5분 뒤 자동으로 이어서 다시 해요. 끄려면 Terminal 창에서 Ctrl+C.
SCRIPT_NAME="제미나이 번역 자동생성.py"
export GEMINI_PROFILE="chrome_profile_gemini_translate"
cd "$(dirname "$0")"
S=$(find "$HOME/파이썬" "$HOME/feedbuddi-saju" "$HOME" -maxdepth 4 -name "$SCRIPT_NAME" 2>/dev/null | head -1)
if [ -z "$S" ]; then echo "'$SCRIPT_NAME' 파일을 못 찾았어요. VS Code 클로드에게 만들어 달라고 하세요."; read -p "엔터를 누르면 닫혀요"; exit 1; fi
echo "실행: $S  (크롬 프로필: $GEMINI_PROFILE)"
cd "$(dirname "$S")"
n=0
while true; do
  caffeinate -i python3 "$S"; code=$?
  if [ $code -eq 0 ]; then echo; echo "✅ 끝났어요!"; break; fi
  n=$((n+1)); echo; echo "⏸ 멈췄어요(코드 $code). 5분 뒤 이어서 다시 해요 ($n번째)..."; sleep 300
done
read -p "엔터를 누르면 닫혀요"
