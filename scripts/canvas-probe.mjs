#!/usr/bin/env node
// =============================================================================
// canvas-probe.mjs — 디자인 캔버스를 "눌러보고" 그 결과를 파일로 떨군다.
//
// 캔버스(Claude Design 아티팩트)는 sc-if / x-import 같은 전용 템플릿 DSL이라
// 소스를 그대로 읽으면 {{ 바인딩 }}만 보인다. 이 스크립트는 실제 브라우저에서
// 렌더한 뒤의 DOM을 뽑기 때문에, 눈이 없는 에이전트(Codex 등)도 화면이
// 어떻게 구성되고 누르면 무엇이 바뀌는지 텍스트로 확인할 수 있다.
//
// 준비:
//   # 캔버스 HTML을 정적 서버로 띄운다 (기본 포트 3222)
//   python3 -m http.server 3222 --directory <캔버스 html이 있는 폴더>
//
// 사용법:
//   node scripts/canvas-probe.mjs                     # 홈 화면 캡처
//   node scripts/canvas-probe.mjs --screen 안내
//   node scripts/canvas-probe.mjs --screen 안내 --click 경포권
//   node scripts/canvas-probe.mjs --screen "AI 코스" --click 자연 --click 맛집
//   node scripts/canvas-probe.mjs --url http://localhost:3111 --screen 안내
//
// 결과 (기본 .design-probe/):
//   <이름>.png    전체 스크린샷 (사람·비전 모델용)
//   <이름>.txt    보이는 요소 개요 — 태그/역할/글자/위치·크기 (텍스트 AI용)
//   <이름>.html   렌더 후 DOM — --html 지정 시에만 (캔버스는 수 MB라 기본 꺼둠)
// =============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

// Playwright는 apps/web 워크스페이스에 설치돼 있다. 이 스크립트는 리포
// 루트에 있으므로 스크립트 위치가 아니라 실행 위치(cwd) 기준으로 찾는다.
//   pnpm --filter web exec node ../../scripts/canvas-probe.mjs ...
const requireFromCwd = createRequire(path.join(process.cwd(), "noop.js"));
const { chromium } = requireFromCwd("@playwright/test");

function parseArgs(argv) {
  const out = { url: "http://localhost:3222", screen: null, click: [], outDir: ".design-probe", wait: 20000, html: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") out.url = argv[++i];
    else if (a === "--screen") out.screen = argv[++i];
    else if (a === "--click") out.click.push(argv[++i]);
    else if (a === "--out") out.outDir = argv[++i];
    else if (a === "--wait") out.wait = Number(argv[++i]);
    else if (a === "--html") out.html = true;
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

// 보이는 요소만 훑어 계층/위치를 텍스트로 만든다. 스크린샷을 못 보는
// 에이전트가 "무엇이 어디에 얼마만 한 크기로 있는지" 알 수 있게 하는 게 목적.
function outlineScript() {
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "CIRCLE", "RECT", "DEFS", "G"]);
  const lines = [];

  function ownText(el) {
    let t = "";
    for (const node of el.childNodes) {
      if (node.nodeType === 3) t += node.textContent;
    }
    return t.replace(/\s+/g, " ").trim();
  }

  function walk(el, depth) {
    if (depth > 22 || SKIP.has(el.tagName)) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return;

    const text = ownText(el);
    const role = el.getAttribute("role");
    const label = el.getAttribute("aria-label");
    const interactive = /^(A|BUTTON|INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

    if (text || interactive || label || role) {
      const bits = [`<${el.tagName.toLowerCase()}>`];
      if (role) bits.push(`role=${role}`);
      if (label) bits.push(`aria-label="${label}"`);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        const ph = el.getAttribute("placeholder");
        if (ph) bits.push(`placeholder="${ph}"`);
        if (el.value) bits.push(`value="${el.value}"`);
      }
      if (text) bits.push(JSON.stringify(text.slice(0, 120)));
      bits.push(`@${Math.round(rect.x)},${Math.round(rect.y)} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      lines.push("  ".repeat(depth) + bits.join(" "));
    }
    for (const child of el.children) walk(child, depth + 1);
  }

  walk(document.body, 0);
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(
      [
        "사용법: node scripts/canvas-probe.mjs [옵션]",
        "  --url <주소>      기본 http://localhost:3222 (캔버스 정적 서버)",
        "  --screen <이름>   상단 탭을 눌러 이동 (홈 / 안내 / AI 코스 / 테마 / 마이페이지)",
        "  --click <문구>    해당 문구의 요소를 클릭 (여러 번 지정 가능, 순서대로)",
        "  --out <폴더>      결과 폴더 (기본 .design-probe)",
        "  --wait <ms>       초기 렌더 대기 (기본 20000 — 캔버스 번들이 크다)",
        "  --html            렌더 후 DOM도 저장 (캔버스는 수 MB라 기본 꺼짐)",
      ].join("\n"),
    );
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  console.log(`열기: ${args.url}`);
  await page.goto(args.url, { waitUntil: "domcontentloaded" });

  // 캔버스는 8MB 번들을 풀고 폰트를 심느라 첫 화면이 한동안 비어 있다.
  await page
    .locator("text=온강릉")
    .first()
    .waitFor({ timeout: args.wait })
    .catch(() => console.log("! 상단 로고를 못 찾음 — 계속 진행"));
  await page.waitForTimeout(2500);

  const steps = [];
  if (args.screen) {
    console.log(`탭 이동: ${args.screen}`);
    // 우리 구현은 하단 탭바(모바일용, 데스크톱에서 숨김)에도 같은 글자가 있다.
    // 숨은 요소를 집으면 클릭이 타임아웃나므로 보이는 것만 고른다.
    await page
      .getByText(args.screen, { exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await page.waitForTimeout(1800);
    steps.push(`screen=${args.screen}`);
  }
  for (const target of args.click) {
    console.log(`클릭: ${target}`);
    await page
      .getByText(target, { exact: true })
      .filter({ visible: true })
      .first()
      .click();
    await page.waitForTimeout(1200);
    steps.push(`click=${target}`);
  }

  const name =
    [args.screen ?? "home", ...args.click].join("_").replace(/[^\w가-힣-]+/g, "-") || "home";
  await mkdir(args.outDir, { recursive: true });

  const png = path.join(args.outDir, `${name}.png`);
  await page.screenshot({ path: png, fullPage: true });

  const outline = await page.evaluate(outlineScript);
  const header = `# 디자인 캔버스 probe\n# url: ${args.url}\n# steps: ${steps.join(" → ") || "(없음)"}\n# 형식: <태그> [role] [aria-label] "글자" @x,y 너비x높이\n\n`;
  const txt = path.join(args.outDir, `${name}.txt`);
  await writeFile(txt, header + outline, "utf8");

  // 캔버스의 page.content()는 원본 번들(수 MB)을 통째로 담아 쓸모가 없다.
  // 필요할 때만 --html로 받는다.
  let html = null;
  if (args.html) {
    html = path.join(args.outDir, `${name}.html`);
    await writeFile(html, await page.content(), "utf8");
  }

  await browser.close();
  console.log(`\n완료:\n  ${png}\n  ${txt}   (${outline.split("\n").length}줄)${html ? `\n  ${html}` : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
