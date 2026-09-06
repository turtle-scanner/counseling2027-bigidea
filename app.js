// ==========================================================================
// 2027 전문상담 임용고시 핵심교재 - 90점 만점 돌파형 웹 애플리케이션 로직 (app.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 상태 관리
  let currentFilter = "all"; // 'all', 'p3', 'bookmark'
  let searchQuery = "";
  let isBlindMode = false;
  let completedTopics = JSON.parse(localStorage.getItem("completed_counseling_topics") || "[]");
  let bookmarkedTopics = JSON.parse(localStorage.getItem("bookmarked_counseling_topics") || "[]");
  let userAnswers = JSON.parse(localStorage.getItem("counseling_user_answers") || "{}");
  let fontSizeLevel = parseInt(localStorage.getItem("counseling_font_size") || "16", 10);

  // DOM Elements
  const sidebarNav = document.getElementById("sidebarNav");
  const contentArea = document.getElementById("contentArea");
  const searchInput = document.getElementById("searchInput");
  const chipAll = document.getElementById("chipAll");
  const chipP3 = document.getElementById("chipP3");
  const chipBookmark = document.getElementById("chipBookmark");
  const bookmarkCount = document.getElementById("bookmarkCount");

  const btnBlindToggle = document.getElementById("btnBlindToggle");
  const btnRandomQuiz = document.getElementById("btnRandomQuiz");
  const btnFontIncrease = document.getElementById("btnFontIncrease");
  const btnFontDecrease = document.getElementById("btnFontDecrease");
  const fontSizeDisplay = document.getElementById("fontSizeDisplay");
  const btnFontReset = document.getElementById("btnFontReset");
  const btnFloatFont = document.getElementById("btnFloatFont");
  const fontPopupPanel = document.getElementById("fontPopupPanel");
  const btnFontPopupClose = document.getElementById("btnFontPopupClose");
  const fontPopupPercent = document.getElementById("fontPopupPercent");
  const btnStepperDec = document.getElementById("btnStepperDec");
  const btnStepperInc = document.getElementById("btnStepperInc");
  const btnStepperReset = document.getElementById("btnStepperReset");
  const presetBtns = document.querySelectorAll(".btn-preset");
  const progressPercent = document.getElementById("progressPercent");
  const progressFill = document.getElementById("progressFill");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const btnFloatMenu = document.getElementById("btnFloatMenu");

  // Pomodoro Elements
  const pomoTimeDisplay = document.getElementById("pomoTimeDisplay");
  const pomoStartBtn = document.getElementById("pomoStartBtn");
  const pomoResetBtn = document.getElementById("pomoResetBtn");
  let pomoTime = 25 * 60;
  let pomoTimerId = null;
  let isPomoRunning = false;

  // Random Quiz Modal Elements
  const quizModalBackdrop = document.getElementById("quizModalBackdrop");
  const btnQuizClose = document.getElementById("btnQuizClose");
  const btnQuizReveal = document.getElementById("btnQuizReveal");
  const btnQuizNext = document.getElementById("btnQuizNext");
  const quizModalBadge = document.getElementById("quizModalBadge");
  const quizModalSubject = document.getElementById("quizModalSubject");
  const quizModalTopicTitle = document.getElementById("quizModalTopicTitle");
  const quizModalQuestion = document.getElementById("quizModalQuestion");
  const quizModalAnswerArea = document.getElementById("quizModalAnswerArea");
  const quizModalLines = document.getElementById("quizModalLines");
  const quizModalFormula = document.getElementById("quizModalFormula");

  // 1. 키워드 블라인드 마스킹 변환 함수
  function parseKeywords(text) {
    if (!text) return "";
    return text.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
      return `<span class="keyword-blind" title="클릭하여 키워드 확인" onclick="this.classList.toggle('revealed')">${p1}</span>`;
    });
  }

  // 2. 오답노트 북마크 카운터 갱신
  function updateBookmarkCount() {
    if (bookmarkCount) {
      bookmarkCount.textContent = bookmarkedTopics.length;
    }
  }

  // 3. 전체 교재 렌더링
  function renderContent() {
    contentArea.innerHTML = "";

    let totalDisplayedTopics = 0;

    TEXTBOOK_DATA.forEach((subject) => {
      // 필터 적용
      const filteredTopics = subject.topics.filter((topic) => {
        let matchesFilter = false;
        if (currentFilter === "all") matchesFilter = true;
        else if (currentFilter === "p3") matchesFilter = topic.priority === 3;
        else if (currentFilter === "bookmark") matchesFilter = bookmarkedTopics.includes(topic.id);

        const matchesSearch =
          searchQuery === "" ||
          topic.title.toLowerCase().includes(searchQuery) ||
          (topic.chunking && topic.chunking.toLowerCase().includes(searchQuery)) ||
          JSON.stringify(topic.coreTable).toLowerCase().includes(searchQuery) ||
          JSON.stringify(topic.templateAnswer).toLowerCase().includes(searchQuery) ||
          JSON.stringify(topic.scoringPitfalls || "").toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
      });

      if (filteredTopics.length === 0) return;
      totalDisplayedTopics += filteredTopics.length;

      // 과목 배너 섹션
      const subjectSec = document.createElement("section");
      subjectSec.className = "subject-section";
      subjectSec.id = subject.id;

      subjectSec.innerHTML = `
        <div class="subject-banner">
          <div class="subject-banner-header">
            <span class="subject-banner-icon">${subject.icon}</span>
            <h2 class="subject-banner-title">${subject.title}</h2>
          </div>
          <p class="subject-banner-desc">${subject.description}</p>
        </div>
      `;

      // 각 주제별 카드 렌더링
      filteredTopics.forEach((topic) => {
        const isCompleted = completedTopics.includes(topic.id);
        const isBookmarked = bookmarkedTopics.includes(topic.id);
        const card = document.createElement("article");
        card.className = "topic-card";
        card.id = topic.id;

        // 우선순위 텍스트
        const pClass = topic.priority === 3 ? "p3" : topic.priority === 2 ? "p2" : "p1";
        const pText = topic.priority === 3 ? "★★★ 2027 0순위" : topic.priority === 2 ? "★★ 빈출" : "★ 핵심";

        // 코어 테이블 행 생성
        let coreRowsHtml = "";
        topic.coreTable.rows.forEach((row) => {
          coreRowsHtml += `
            <tr>
              <td class="col-table-cat">${parseKeywords(row[0])}</td>
              <td class="col-table-core">${parseKeywords(row[1])}</td>
              <td class="col-table-chunking">${parseKeywords(row[2])}</td>
              <td class="col-table-exam">${parseKeywords(row[3])}</td>
            </tr>
          `;
        });

        // 비교 테이블 생성
        let comparisonHtml = "";
        if (topic.comparisonTable) {
          let compHeaders = topic.comparisonTable.headers
            .map((h, idx) => `<th class="th-comp-${idx}">${h}</th>`)
            .join("");
          let compRows = topic.comparisonTable.rows
            .map(
              (r) =>
                `<tr>
                  <td class="col-comp-cat">${parseKeywords(r[0])}</td>
                  <td class="col-comp-body">${parseKeywords(r[1])}</td>
                  <td class="col-comp-body">${parseKeywords(r[2])}</td>
                </tr>`
            )
            .join("");

          comparisonHtml = `
            <div class="comparison-table-wrapper">
              <div class="comparison-header">
                <span>🔍 [핵심 비교표] ${topic.comparisonTable.title}</span>
                <span class="table-scroll-hint-badge">👉 가로 스크롤</span>
              </div>
              <div class="data-table-wrapper" style="border:none; border-radius:0;">
                <table class="data-table comp-table">
                  <thead><tr>${compHeaders}</tr></thead>
                  <tbody>${compRows}</tbody>
                </table>
              </div>
            </div>
          `;
        }

        // 한국교육과정평가원 서술형 정식 답안지 (4줄 규격) 렌더링
        let templateHtml = "";
        if (topic.templateAnswer) {
          const ta = topic.templateAnswer;
          const rawLines = ta.lines && ta.lines.length === 4 ? ta.lines : (ta.structure ? ta.structure.split("\n") : []);
          
          const guideTags = [
            "줄 [01] · 핵심 개념 정의 및 직접 진단",
            "줄 [02] · 기출 지문 단서 연계 및 발생 기제",
            "줄 [03] · 상담교사의 구체적 개입 전략 및 발화",
            "줄 [04] · 치료적 기대 효과 및 최종 행동 변화"
          ];

          let ruledRowsHtml = "";
          rawLines.forEach((lineStr, lineIdx) => {
            const lineNum = String(lineIdx + 1).padStart(2, "0");
            const cleanContent = lineStr.replace(/^\[[0-9]+줄\]\s*/, "");
            const guideTag = guideTags[lineIdx] || `답안 라인 ${lineNum}`;

            ruledRowsHtml += `
              <div class="sheet-line-row">
                <div class="sheet-line-num-col">
                  <span class="sheet-line-num">${lineNum}</span>
                </div>
                <div class="sheet-line-body">
                  <div class="sheet-line-guide-tag">${guideTag}</div>
                  <div class="sheet-line-text">${parseKeywords(cleanContent)}</div>
                </div>
              </div>
            `;
          });

          templateHtml = `
            <div class="official-answer-sheet" id="sheet-${topic.id}">
              <div class="sheet-top-banner">
                <div class="sheet-top-title-group">
                  <div class="sheet-gov-badge">
                    <span class="sheet-gov-icon">🏛️</span>
                    <span class="sheet-gov-text">한국교육과정평가원 전문상담 서술형 정식 답안지</span>
                  </div>
                  <div class="sheet-spec-tag">문항당 4점 · 정확히 4줄 답안란 규격</div>
                </div>
                <button class="btn-copy-answer" data-topic-id="${topic.id}" title="4줄 모범 답안 전체 복사">
                  <span class="btn-copy-icon">📋</span>
                  <span>4줄 답안 복사</span>
                </button>
              </div>

              <div class="sheet-question-container">
                <div class="sheet-question-label">【2027 실전 출제 예상 문항】</div>
                <div class="sheet-question-body">${ta.question.replace(/^\[2027 실전 예상\]\s*/, "")}</div>
              </div>

              <div class="sheet-paper">
                <div class="sheet-lines-container">
                  ${ruledRowsHtml}
                </div>
              </div>

              <div class="sheet-bottom-notice">
                <span class="notice-icon">⚡</span>
                <span><strong>4줄 압축 작성 공식</strong>: [01 개념진단] ➔ [02 발생기제] ➔ [03 교사개입] ➔ [04 치료효과] | 황금색 키워드는 채점 핵심 배점 요소입니다.</span>
              </div>
            </div>
          `;
        }

        // 실전 모의 자가 인출 트레이너 (직접 타이핑 & 키워드 자동 채점기)
        const savedAnswer = userAnswers[topic.id] || ["", "", "", ""];
        const selfTestHtml = `
          <div class="self-test-wrapper" id="selftest-wrap-${topic.id}">
            <div class="self-test-toggle-bar">
              <button class="btn-toggle-selftest" data-topic-id="${topic.id}">
                <span class="selftest-btn-icon">✍️</span>
                <span class="selftest-btn-text">실전 자가 인출 훈련 (직접 써보고 4점 만점 자동 채점하기)</span>
                <span class="selftest-arrow-icon" id="arrow-${topic.id}">▼</span>
              </button>
            </div>
            <div class="self-test-panel hidden" id="selftest-panel-${topic.id}">
              <div class="selftest-desc">
                📌 <strong>시험장 실전 시뮬레이션</strong>: 실제 답안지 줄눈에 맞춰 4줄을 직접 작성해보세요. [채점하기]를 누르면 핵심 키워드 적중 여부와 예상 획득 점수(4점 만점)를 즉시 피드백합니다.
              </div>
              <div class="selftest-inputs">
                <div class="selftest-row">
                  <div class="selftest-row-num">01</div>
                  <input type="text" class="selftest-input input-line-0" data-topic-id="${topic.id}" data-line="0" placeholder="[1줄] 핵심 개념 정의 및 직접 진단 입력..." value="${savedAnswer[0] ? savedAnswer[0].replace(/"/g, '&quot;') : ""}">
                </div>
                <div class="selftest-row">
                  <div class="selftest-row-num">02</div>
                  <input type="text" class="selftest-input input-line-1" data-topic-id="${topic.id}" data-line="1" placeholder="[2줄] 기출 지문 단서 연계 및 발생 기제 입력..." value="${savedAnswer[1] ? savedAnswer[1].replace(/"/g, '&quot;') : ""}">
                </div>
                <div class="selftest-row">
                  <div class="selftest-row-num">03</div>
                  <input type="text" class="selftest-input input-line-2" data-topic-id="${topic.id}" data-line="2" placeholder="[3줄] 상담교사 구체적 개입 전략 및 발화 입력..." value="${savedAnswer[2] ? savedAnswer[2].replace(/"/g, '&quot;') : ""}">
                </div>
                <div class="selftest-row">
                  <div class="selftest-row-num">04</div>
                  <input type="text" class="selftest-input input-line-3" data-topic-id="${topic.id}" data-line="3" placeholder="[4줄] 치료적 기대 효과 및 최종 행동 변화 입력..." value="${savedAnswer[3] ? savedAnswer[3].replace(/"/g, '&quot;') : ""}">
                </div>
              </div>
              <div class="selftest-actions">
                <button class="btn-grade-selftest" data-topic-id="${topic.id}">
                  <span>💯</span> <span>키워드 자동 채점하기</span>
                </button>
                <button class="btn-clear-selftest" data-topic-id="${topic.id}">
                  <span>⟲</span> <span>초기화</span>
                </button>
              </div>
              <div class="selftest-result-box hidden" id="selftest-result-${topic.id}"></div>
            </div>
          </div>
        `;

        // 90점 돌파! 칼채점 방어 & 감점 함정 탈출 비책 박스
        let pitfallsHtml = "";
        if (topic.scoringPitfalls) {
          const sp = topic.scoringPitfalls;
          const trapsList = sp.traps.map(tr => `<li>${tr}</li>`).join("");
          pitfallsHtml = `
            <div class="pitfalls-box">
              <div class="pitfalls-header">
                <div class="pitfalls-title-wrap">
                  <span class="pitfalls-icon">🛡️</span>
                  <span class="pitfalls-title">【90점 만점 돌파! 칼채점 방어 & 감점 함정 탈출 비책】</span>
                </div>
                <span class="pitfalls-badge">칼채점 감점 방어</span>
              </div>
              <div class="pitfalls-body">
                <div class="pitfalls-traps">
                  <div class="pitfalls-sub-title">❌ 시험장에서 1~2점 깎이는 치명적 오답 함정 (주의)</div>
                  <ul class="pitfalls-list">${trapsList}</ul>
                </div>
                <div class="pitfalls-formula">
                  <div class="pitfalls-sub-title">⭕ 채점관이 만점 주는 결정적 채점 공식 & 필수 키워드</div>
                  <div class="formula-box">
                    <span class="formula-icon">🎯</span>
                    <span class="formula-text">${sp.goldenFormula}</span>
                  </div>
                  <div class="must-keywords-tags">
                    ${sp.mustKeywords.map(k => `<span class="must-kw-tag">#${k}</span>`).join(" ")}
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="topic-header">
            <div class="topic-title-wrap">
              <div class="topic-meta-badges">
                <span class="badge-priority ${pClass}">${pText}</span>
                <span class="badge-exam">📌 ${topic.examYears}</span>
              </div>
              <h3 class="topic-main-title">${topic.title}</h3>
            </div>
            <div class="topic-actions">
              <button class="btn-bookmark-topic ${isBookmarked ? "active" : ""}" data-topic-id="${topic.id}" title="오답노트 / 취약 주제 저장">
                <span class="star-icon">${isBookmarked ? "⭐" : "☆"}</span>
                <span class="bookmark-text">${isBookmarked ? "오답노트 담김" : "오답노트"}</span>
              </button>
              <button class="btn-complete-topic ${isCompleted ? "completed" : ""}" data-topic-id="${topic.id}">
                ${isCompleted ? "✓ 학습 완료" : "○ 완료 체크"}
              </button>
            </div>
          </div>

          <div class="chunking-box">
            ${topic.chunking}
          </div>

          <div class="table-section">
            <div class="table-section-title">
              <span>📋 4열 핵심 개념 & 채점 공식 요약표</span>
              <span class="table-scroll-hint-badge">👉 가로 스크롤</span>
            </div>
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="th-table-cat">${topic.coreTable.headers[0]}</th>
                    <th class="th-table-core">${topic.coreTable.headers[1]}</th>
                    <th class="th-table-chunking">${topic.coreTable.headers[2]}</th>
                    <th class="th-table-exam">${topic.coreTable.headers[3]}</th>
                  </tr>
                </thead>
                <tbody>
                  ${coreRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          ${comparisonHtml}
          ${templateHtml}
          ${selfTestHtml}
          ${pitfallsHtml}
        `;

        subjectSec.appendChild(card);
      });

      contentArea.appendChild(subjectSec);
    });

    if (totalDisplayedTopics === 0) {
      contentArea.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">${currentFilter === "bookmark" ? "⭐" : "🔍"}</div>
          <h3 class="empty-state-title">${currentFilter === "bookmark" ? "오답노트에 담긴 주제가 없습니다." : "검색 결과가 없습니다."}</h3>
          <p class="empty-state-desc">
            ${currentFilter === "bookmark" 
              ? "각 주제 카드 우측 상단의 [☆ 오답노트] 버튼을 눌러 자주 틀리거나 헷갈리는 취약 주제를 모아보세요!" 
              : "다른 키워드로 검색해보거나 필터를 변경해보세요."}
          </p>
        </div>
      `;
    }

    // 4줄 답안 복사 버튼 이벤트 연결
    document.querySelectorAll(".btn-copy-answer").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const topicId = btn.getAttribute("data-topic-id");
        let targetTopic = findTopicById(topicId);
        if (!targetTopic || !targetTopic.templateAnswer) return;

        const ta = targetTopic.templateAnswer;
        const raw = ta.lines && ta.lines.length === 4 ? ta.lines : (ta.structure ? ta.structure.split("\n") : []);
        const cleanLines = raw.map((l, idx) => {
          const stripped = l.replace(/\{\{(.*?)\}\}/g, "$1").replace(/^\[[0-9]+줄\]\s*/, "");
          const numStr = String(idx + 1).padStart(2, "0");
          return `[${numStr}] ${stripped}`;
        });

        const copyText = `[2027 전문상담 임용 모범 답안]\n주제: ${targetTopic.title}\n문항: ${ta.question}\n\n【한국교육과정평가원 서술형 정식 4줄 답안】\n${cleanLines.join("\n")}`;

        navigator.clipboard.writeText(copyText).then(() => {
          const origContent = btn.innerHTML;
          btn.innerHTML = `<span class="btn-copy-icon">✓</span><span>복사 완료!</span>`;
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = origContent;
            btn.classList.remove("copied");
          }, 1800);
        }).catch((err) => {
          console.error("복사 실패:", err);
        });
      });
    });

    // 오답노트 북마크 버튼 이벤트 연결
    document.querySelectorAll(".btn-bookmark-topic").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tId = btn.getAttribute("data-topic-id");
        if (bookmarkedTopics.includes(tId)) {
          bookmarkedTopics = bookmarkedTopics.filter((id) => id !== tId);
          btn.classList.remove("active");
          btn.querySelector(".star-icon").textContent = "☆";
          btn.querySelector(".bookmark-text").textContent = "오답노트";
        } else {
          bookmarkedTopics.push(tId);
          btn.classList.add("active");
          btn.querySelector(".star-icon").textContent = "⭐";
          btn.querySelector(".bookmark-text").textContent = "오답노트 담김";
        }
        localStorage.setItem("bookmarked_counseling_topics", JSON.stringify(bookmarkedTopics));
        updateBookmarkCount();
        if (currentFilter === "bookmark") {
          renderContent();
        }
      });
    });

    // 완료 체크 버튼 이벤트 연결
    document.querySelectorAll(".btn-complete-topic").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tId = btn.getAttribute("data-topic-id");
        if (completedTopics.includes(tId)) {
          completedTopics = completedTopics.filter((id) => id !== tId);
          btn.classList.remove("completed");
          btn.textContent = "○ 완료 체크";
        } else {
          completedTopics.push(tId);
          btn.classList.add("completed");
          btn.textContent = "✓ 학습 완료";
        }
        localStorage.setItem("completed_counseling_topics", JSON.stringify(completedTopics));
        updateProgress();
        updateSidebarChecks();
      });
    });

    // 실전 자가 인출 트레이너 토글 이벤트
    document.querySelectorAll(".btn-toggle-selftest").forEach((btn) => {
      btn.addEventListener("click", () => {
        const topicId = btn.getAttribute("data-topic-id");
        const panel = document.getElementById(`selftest-panel-${topicId}`);
        const arrow = document.getElementById(`arrow-${topicId}`);
        if (panel) {
          panel.classList.toggle("hidden");
          const isOpen = !panel.classList.contains("hidden");
          arrow.textContent = isOpen ? "▲" : "▼";
          if (isOpen) {
            const firstInput = panel.querySelector(".input-line-0");
            if (firstInput) firstInput.focus();
          }
        }
      });
    });

    // 실전 자가 인출 입력 저장 이벤트
    document.querySelectorAll(".selftest-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const tId = inp.getAttribute("data-topic-id");
        const lIdx = parseInt(inp.getAttribute("data-line"), 10);
        if (!userAnswers[tId]) userAnswers[tId] = ["", "", "", ""];
        userAnswers[tId][lIdx] = inp.value;
        localStorage.setItem("counseling_user_answers", JSON.stringify(userAnswers));
      });
    });

    // 실전 자가 인출 키워드 자동 채점 이벤트
    document.querySelectorAll(".btn-grade-selftest").forEach((btn) => {
      btn.addEventListener("click", () => {
        const topicId = btn.getAttribute("data-topic-id");
        gradeSelfTest(topicId);
      });
    });

    // 실전 자가 인출 초기화 이벤트
    document.querySelectorAll(".btn-clear-selftest").forEach((btn) => {
      btn.addEventListener("click", () => {
        const topicId = btn.getAttribute("data-topic-id");
        const panel = document.getElementById(`selftest-panel-${topicId}`);
        if (panel) {
          panel.querySelectorAll(".selftest-input").forEach((inp) => (inp.value = ""));
          userAnswers[topicId] = ["", "", "", ""];
          localStorage.setItem("counseling_user_answers", JSON.stringify(userAnswers));
          const resBox = document.getElementById(`selftest-result-${topicId}`);
          if (resBox) resBox.classList.add("hidden");
        }
      });
    });
  }

  // 4. 특정 토픽 탐색 헬퍼
  function findTopicById(topicId) {
    for (const sub of TEXTBOOK_DATA) {
      const found = sub.topics.find((t) => t.id === topicId);
      if (found) return found;
    }
    return null;
  }

  // 5. 실전 자가 인출 키워드 자동 채점 알고리즘
  function gradeSelfTest(topicId) {
    const topic = findTopicById(topicId);
    if (!topic) return;

    const panel = document.getElementById(`selftest-panel-${topicId}`);
    const resultBox = document.getElementById(`selftest-result-${topicId}`);
    if (!panel || !resultBox) return;

    const lines = [
      panel.querySelector(".input-line-0").value || "",
      panel.querySelector(".input-line-1").value || "",
      panel.querySelector(".input-line-2").value || "",
      panel.querySelector(".input-line-3").value || ""
    ];

    const fullText = lines.join(" ").replace(/\s+/g, "").toLowerCase();

    // 필수 키워드 리스트 추출
    let mustKeywords = [];
    if (topic.scoringPitfalls && topic.scoringPitfalls.mustKeywords) {
      mustKeywords = topic.scoringPitfalls.mustKeywords;
    } else {
      const raw = topic.templateAnswer ? (topic.templateAnswer.structure || "") : "";
      const matches = raw.match(/\{\{(.*?)\}\}/g) || [];
      mustKeywords = matches.map(m => m.replace(/[\{\}]/g, "")).slice(0, 5);
    }

    if (mustKeywords.length === 0) {
      mustKeywords = ["핵심 개념", "기제", "상담 기법", "효과"];
    }

    const hitKeywords = [];
    const missedKeywords = [];

    mustKeywords.forEach((kw) => {
      const cleanKw = kw.replace(/\(.*?\)/g, "").replace(/\s+/g, "").toLowerCase();
      if (cleanKw.length >= 2 && fullText.includes(cleanKw)) {
        hitKeywords.push(kw);
      } else {
        missedKeywords.push(kw);
      }
    });

    const hitRate = hitKeywords.length / mustKeywords.length;
    let score = 1;
    let scoreBadgeClass = "score-low";
    let feedbackMsg = "";

    if (hitRate >= 0.75) {
      score = 4;
      scoreBadgeClass = "score-perfect";
      feedbackMsg = "🎉 <strong>[만점 합격권!]</strong> 핵심 채점 키워드가 완벽하게 인출되었습니다. 실제 시험장에서도 4점 만점이 보장되는 모범 답안입니다.";
    } else if (hitRate >= 0.5) {
      score = 3;
      scoreBadgeClass = "score-good";
      feedbackMsg = "👍 <strong>[우수 답안!]</strong> 핵심 개념이 충실하나 1~2개 감점 방지 키워드가 누락되었습니다. 아래 누락 키워드를 보강해보세요.";
    } else if (hitRate >= 0.25) {
      score = 2;
      scoreBadgeClass = "score-medium";
      feedbackMsg = "⚠️ <strong>[개념 보강 필요]</strong> 문장의 골격은 갖추었으나 채점관이 점수를 주는 필수 학술 용어가 부족합니다. 모범 답안과 1:1 대조해보세요.";
    } else {
      score = 1;
      scoreBadgeClass = "score-low";
      feedbackMsg = "❗ <strong>[재인출 권장]</strong> 아직 핵심 키워드가 충분히 인출되지 않았습니다. 4줄 모범답안을 3회 정독한 뒤 다시 타이핑해보세요!";
    }

    const hitChips = hitKeywords.map(k => `<span class="badge-kw hit">✓ ${k}</span>`).join(" ");
    const missChips = missedKeywords.map(k => `<span class="badge-kw miss">✗ ${k}</span>`).join(" ");

    resultBox.innerHTML = `
      <div class="result-header">
        <div class="result-score-wrap">
          <span class="result-score-badge ${scoreBadgeClass}">예상 획득 점수: ${score}점 / 4점 만점</span>
          <span class="result-rate-text">(키워드 적중률: ${Math.round(hitRate * 100)}%)</span>
        </div>
      </div>
      <div class="result-feedback-msg">${feedbackMsg}</div>
      <div class="result-keywords-eval">
        <div class="kw-eval-group">
          <div class="kw-eval-label">적중한 채점 키워드 (${hitKeywords.length}개):</div>
          <div class="kw-eval-tags">${hitChips || "<span class='none-text'>없음</span>"}</div>
        </div>
        <div class="kw-eval-group">
          <div class="kw-eval-label">보완이 필요한 누락 키워드 (${missedKeywords.length}개):</div>
          <div class="kw-eval-tags">${missChips || "<span class='perfect-text'>없음 (완벽 적중!)</span>"}</div>
        </div>
      </div>
    `;

    resultBox.classList.remove("hidden");
  }

  // 6. 사이드바 목차 렌더링
  function renderSidebar() {
    sidebarNav.innerHTML = "";

    TEXTBOOK_DATA.forEach((subject, sIdx) => {
      const group = document.createElement("div");
      group.className = "subject-group" + (sIdx === 0 ? " open" : "");

      let topicLinksHtml = "";
      subject.topics.forEach((topic) => {
        const isCompleted = completedTopics.includes(topic.id);
        const isBookmarked = bookmarkedTopics.includes(topic.id);
        const pBadge = topic.priority === 3 ? "<span style='color:#ef4444; font-weight:800;'>★★★</span>" : "";
        const starBadge = isBookmarked ? "<span style='color:#facc15; font-size:0.8rem; margin-right:3px;'>⭐</span>" : "";

        topicLinksHtml += `
          <li>
            <a href="#${topic.id}" class="topic-link ${isCompleted ? "completed" : ""}" data-target="${topic.id}">
              <span>${starBadge}${pBadge} ${topic.title.replace(/^[0-9]+\.\s*/, "")}</span>
              <span class="topic-check-icon">✓</span>
            </a>
          </li>
        `;
      });

      group.innerHTML = `
        <button class="subject-toggle" aria-expanded="${sIdx === 0}">
          <div class="subject-toggle-left">
            <span class="subject-icon">${subject.icon}</span>
            <span class="subject-title">${subject.title}</span>
          </div>
          <span class="arrow-icon">▶</span>
        </button>
        <ul class="topic-list">
          ${topicLinksHtml}
        </ul>
      `;

      // 아코디언 클릭
      group.querySelector(".subject-toggle").addEventListener("click", () => {
        group.classList.toggle("open");
      });

      // 터치 시 사이드바 서랍 자동 닫힘
      group.querySelectorAll(".topic-link").forEach((link) => {
        link.addEventListener("click", () => {
          if (window.innerWidth <= 1024) {
            closeSidebar();
          }
        });
      });

      sidebarNav.appendChild(group);
    });
  }

  // 7. 사이드바 체크 표시 업데이트
  function updateSidebarChecks() {
    document.querySelectorAll(".topic-link").forEach((link) => {
      const targetId = link.getAttribute("data-target");
      if (completedTopics.includes(targetId)) {
        link.classList.add("completed");
      } else {
        link.classList.remove("completed");
      }
    });
  }

  // 8. 진도율 계산 및 프로그레스 바 갱신
  function updateProgress() {
    let totalTopicsCount = 0;
    TEXTBOOK_DATA.forEach((s) => (totalTopicsCount += s.topics.length));
    const percent = Math.round((completedTopics.length / totalTopicsCount) * 100);
    progressPercent.textContent = `${percent}% (${completedTopics.length}/${totalTopicsCount})`;
    progressFill.style.width = `${percent}%`;
  }

  // 9. 키워드 블라인드 모드 토글
  btnBlindToggle.addEventListener("click", () => {
    isBlindMode = !isBlindMode;
    if (isBlindMode) {
      document.body.classList.add("blind-mode-active");
      btnBlindToggle.classList.add("active");
      btnBlindToggle.innerHTML = `<span>👁️</span> <span class="blind-text-desktop">인출 모드 켜짐 (클릭 시 정답)</span><span class="blind-text-mobile">인출 켜짐</span>`;
    } else {
      document.body.classList.remove("blind-mode-active");
      btnBlindToggle.classList.remove("active");
      btnBlindToggle.innerHTML = `<span>👁️</span> <span class="blind-text-desktop">키워드 가리기 (인출 훈련)</span><span class="blind-text-mobile">인출 모드</span>`;
      document.querySelectorAll(".keyword-blind").forEach((el) => el.classList.remove("revealed"));
    }
  });

  // 10. 검색 및 필터 이벤트
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderContent();
    if (searchQuery !== "") {
      document.querySelectorAll(".subject-group").forEach((g) => g.classList.add("open"));
    }
  });

  chipAll.addEventListener("click", () => {
    currentFilter = "all";
    chipAll.classList.add("active");
    chipP3.classList.remove("active");
    chipBookmark.classList.remove("active");
    renderContent();
  });

  chipP3.addEventListener("click", () => {
    currentFilter = "p3";
    chipP3.classList.add("active");
    chipAll.classList.remove("active");
    chipBookmark.classList.remove("active");
    renderContent();
  });

  chipBookmark.addEventListener("click", () => {
    currentFilter = "bookmark";
    chipBookmark.classList.add("active");
    chipAll.classList.remove("active");
    chipP3.classList.remove("active");
    renderContent();
  });

  // 11. 오늘의 1초 랜덤 기출 인출 퀴즈 (Flashcard)
  function openRandomQuiz() {
    const allTopics = [];
    TEXTBOOK_DATA.forEach(s => {
      s.topics.forEach(t => {
        allTopics.push({ subject: s, topic: t });
      });
    });

    if (allTopics.length === 0) return;

    // 랜덤 추첨
    const randIdx = Math.floor(Math.random() * allTopics.length);
    const chosen = allTopics[randIdx];

    const topic = chosen.topic;
    const subject = chosen.subject;

    quizModalSubject.textContent = `${subject.icon} ${subject.title}`;
    quizModalTopicTitle.textContent = topic.title;
    quizModalBadge.textContent = topic.priority === 3 ? "★★★ 2027 0순위" : topic.priority === 2 ? "★★ 빈출" : "★ 핵심";
    quizModalBadge.className = `quiz-modal-badge p-${topic.priority}`;

    const qText = topic.templateAnswer ? topic.templateAnswer.question.replace(/^\[2027 실전 예상\]\s*/, "") : "출제 예상 문제를 불러올 수 없습니다.";
    quizModalQuestion.textContent = qText;

    // 답안 영역 숨김 초기화
    quizModalAnswerArea.classList.add("hidden");
    btnQuizReveal.textContent = "💡 4줄 정식 모범답안 확인";

    // 4줄 답안 준비
    let linesHtml = "";
    if (topic.templateAnswer) {
      const rawLines = topic.templateAnswer.lines || (topic.templateAnswer.structure ? topic.templateAnswer.structure.split("\n") : []);
      rawLines.forEach((l, idx) => {
        const cleanL = l.replace(/^\[[0-9]+줄\]\s*/, "");
        linesHtml += `
          <div class="quiz-line-row">
            <span class="quiz-line-num">0${idx + 1}</span>
            <span class="quiz-line-text">${parseKeywords(cleanL)}</span>
          </div>
        `;
      });
    }
    quizModalLines.innerHTML = linesHtml;

    // 만점 공식
    if (topic.scoringPitfalls) {
      quizModalFormula.innerHTML = `<strong>🎯 만점 채점 공식</strong>: ${topic.scoringPitfalls.goldenFormula}`;
    } else {
      quizModalFormula.innerHTML = "";
    }

    quizModalBackdrop.classList.add("open");
  }

  btnRandomQuiz.addEventListener("click", openRandomQuiz);

  btnQuizReveal.addEventListener("click", () => {
    quizModalAnswerArea.classList.toggle("hidden");
    const isShown = !quizModalAnswerArea.classList.contains("hidden");
    btnQuizReveal.textContent = isShown ? "▲ 답안 접기" : "💡 4줄 정식 모범답안 확인";
  });

  btnQuizNext.addEventListener("click", openRandomQuiz);

  btnQuizClose.addEventListener("click", () => {
    quizModalBackdrop.classList.remove("open");
  });

  quizModalBackdrop.addEventListener("click", (e) => {
    if (e.target === quizModalBackdrop) {
      quizModalBackdrop.classList.remove("open");
    }
  });

  // 12. 폰트 크기 시스템
  function applyFontSize(size) {
    fontSizeLevel = Math.max(13, Math.min(32, size));
    document.documentElement.style.fontSize = `${fontSizeLevel}px`;
    const percent = Math.round((fontSizeLevel / 16) * 100);
    fontSizeDisplay.textContent = `${percent}%`;
    fontPopupPercent.textContent = `${percent}%`;
    localStorage.setItem("counseling_font_size", fontSizeLevel.toString());

    presetBtns.forEach((btn) => {
      const btnSize = parseInt(btn.getAttribute("data-size"), 10);
      btn.classList.toggle("active", btnSize === fontSizeLevel);
    });
  }

  btnFontIncrease.addEventListener("click", () => applyFontSize(fontSizeLevel + 1));
  btnFontDecrease.addEventListener("click", () => applyFontSize(fontSizeLevel - 1));
  btnFontReset.addEventListener("click", () => applyFontSize(16));

  btnStepperInc.addEventListener("click", () => applyFontSize(fontSizeLevel + 1));
  btnStepperDec.addEventListener("click", () => applyFontSize(fontSizeLevel - 1));
  btnStepperReset.addEventListener("click", () => applyFontSize(16));

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = parseInt(btn.getAttribute("data-size"), 10);
      applyFontSize(size);
    });
  });

  btnFloatFont.addEventListener("click", (e) => {
    e.stopPropagation();
    fontPopupPanel.classList.toggle("open");
  });

  btnFontPopupClose.addEventListener("click", () => {
    fontPopupPanel.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    if (fontPopupPanel.classList.contains("open") && !fontPopupPanel.contains(e.target) && e.target !== btnFloatFont) {
      fontPopupPanel.classList.remove("open");
    }
  });

  // 13. 모바일 사이드바 서랍 제어
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarBackdrop.classList.add("active");
    document.body.classList.add("sidebar-open-lock");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("active");
    document.body.classList.remove("sidebar-open-lock");
  }

  mobileMenuBtn.addEventListener("click", openSidebar);
  btnFloatMenu.addEventListener("click", openSidebar);
  sidebarCloseBtn.addEventListener("click", closeSidebar);
  sidebarBackdrop.addEventListener("click", closeSidebar);

  // 14. 25분 포모도로 집중 타이머
  function updatePomoDisplay() {
    const mins = Math.floor(pomoTime / 60);
    const secs = pomoTime % 60;
    pomoTimeDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  pomoStartBtn.addEventListener("click", () => {
    if (isPomoRunning) {
      clearInterval(pomoTimerId);
      isPomoRunning = false;
      pomoStartBtn.textContent = "▶";
      pomoStartBtn.classList.remove("running");
    } else {
      isPomoRunning = true;
      pomoStartBtn.textContent = "❚❚";
      pomoStartBtn.classList.add("running");
      pomoTimerId = setInterval(() => {
        if (pomoTime > 0) {
          pomoTime--;
          updatePomoDisplay();
        } else {
          clearInterval(pomoTimerId);
          isPomoRunning = false;
          pomoStartBtn.textContent = "▶";
          pomoStartBtn.classList.remove("running");
          alert("🔔 25분 몰입 학습 완료! 5분간 가볍게 휴식을 취하세요.");
          pomoTime = 25 * 60;
          updatePomoDisplay();
        }
      }, 1000);
    }
  });

  pomoResetBtn.addEventListener("click", () => {
    clearInterval(pomoTimerId);
    isPomoRunning = false;
    pomoStartBtn.textContent = "▶";
    pomoStartBtn.classList.remove("running");
    pomoTime = 25 * 60;
    updatePomoDisplay();
  });

  // 초기화 실행
  applyFontSize(fontSizeLevel);
  renderSidebar();
  renderContent();
  updateProgress();
  updateSidebarChecks();
  updateBookmarkCount();
  updatePomoDisplay();

  // URL Hash 스크롤 처리
  if (window.location.hash) {
    setTimeout(() => {
      const targetEl = document.querySelector(window.location.hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
        targetEl.classList.add("hash-highlight");
        setTimeout(() => targetEl.classList.remove("hash-highlight"), 3000);
      }
    }, 300);
  }
});
