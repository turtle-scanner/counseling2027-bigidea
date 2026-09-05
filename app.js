// ==========================================================================
// 2027 전문상담 임용고시 핵심교재 - 인터랙티브 웹 애플리케이션 로직 (app.js)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 상태 관리
  let currentFilter = "all"; // 'all' or 'p3'
  let searchQuery = "";
  let isBlindMode = false;
  let completedTopics = JSON.parse(localStorage.getItem("completed_counseling_topics") || "[]");
  let fontSizeLevel = parseInt(localStorage.getItem("counseling_font_size") || "16", 10);

  // DOM Elements
  const sidebarNav = document.getElementById("sidebarNav");
  const contentArea = document.getElementById("contentArea");
  const searchInput = document.getElementById("searchInput");
  const chipAll = document.getElementById("chipAll");
  const chipP3 = document.getElementById("chipP3");
  const btnBlindToggle = document.getElementById("btnBlindToggle");
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

  // 1. 키워드 블라인드 마스킹 변환 함수
  function parseKeywords(text) {
    if (!text) return "";
    return text.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
      return `<span class="keyword-blind" title="클릭하여 키워드 확인" onclick="this.classList.toggle('revealed')">${p1}</span>`;
    });
  }

  // 2. 전체 교재 렌더링
  function renderContent() {
    contentArea.innerHTML = "";

    TEXTBOOK_DATA.forEach((subject) => {
      // 필터 적용
      const filteredTopics = subject.topics.filter((topic) => {
        const matchesFilter = currentFilter === "all" || topic.priority === 3;
        const matchesSearch =
          searchQuery === "" ||
          topic.title.toLowerCase().includes(searchQuery) ||
          (topic.chunking && topic.chunking.toLowerCase().includes(searchQuery)) ||
          JSON.stringify(topic.coreTable).toLowerCase().includes(searchQuery) ||
          JSON.stringify(topic.templateAnswer).toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
      });

      if (filteredTopics.length === 0) return;

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
        const card = document.createElement("article");
        card.className = "topic-card";
        card.id = topic.id;

        // 우선순위 텍스트
        const pClass = topic.priority === 3 ? "p3" : topic.priority === 2 ? "p2" : "p1";
        const pText = topic.priority === 3 ? "★★★ 2027 0순위" : topic.priority === 2 ? "★★ 빈출" : "★ 핵심";

        // 코어 테이블 행 생성 (반응형 클래스 적용)
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

        // 비교 테이블 생성 (반응형 클래스 적용)
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

        // 서술형 답안 템플릿
        let templateHtml = "";
        if (topic.templateAnswer) {
          templateHtml = `
            <div class="template-answer-box">
              <div class="template-header">✍️ ${topic.templateAnswer.question}</div>
              <div class="template-content">${parseKeywords(topic.templateAnswer.structure)}</div>
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
        `;

        subjectSec.appendChild(card);
      });

      contentArea.appendChild(subjectSec);
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
  }

  // 3. 사이드바 목차 렌더링
  function renderSidebar() {
    sidebarNav.innerHTML = "";

    TEXTBOOK_DATA.forEach((subject, sIdx) => {
      const group = document.createElement("div");
      group.className = "subject-group" + (sIdx === 0 ? " open" : "");

      let topicLinksHtml = "";
      subject.topics.forEach((topic) => {
        const isCompleted = completedTopics.includes(topic.id);
        const pBadge = topic.priority === 3 ? "<span style='color:#ef4444; font-weight:800;'>★★★</span>" : "";

        topicLinksHtml += `
          <li>
            <a href="#${topic.id}" class="topic-link ${isCompleted ? "completed" : ""}" data-target="${topic.id}">
              <span>${pBadge} ${topic.title.replace(/^[0-9]+\.\s*/, "")}</span>
              <span class="topic-check-icon">✓</span>
            </a>
          </li>
        `;
      });

      group.innerHTML = `
        <button class="subject-toggle" type="button">
          <div class="subject-title-wrap">
            <span class="subject-icon">${subject.icon}</span>
            <span>${subject.title}</span>
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

      // 태블릿/모바일에서 항목 터치 시 사이드바 서랍 자동 닫힘
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

  // 4. 사이드바 체크 표시 업데이트
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

  // 5. 진도율 계산 및 프로그레스 바 갱신
  function updateProgress() {
    let totalTopicsCount = 0;
    TEXTBOOK_DATA.forEach((s) => (totalTopicsCount += s.topics.length));
    const percent = Math.round((completedTopics.length / totalTopicsCount) * 100);
    progressPercent.textContent = `${percent}% (${completedTopics.length}/${totalTopicsCount})`;
    progressFill.style.width = `${percent}%`;
  }

  // 6. 키워드 블라인드 모드 토글
  btnBlindToggle.addEventListener("click", () => {
    isBlindMode = !isBlindMode;
    if (isBlindMode) {
      document.body.classList.add("blind-mode-active");
      btnBlindToggle.classList.add("active");
      btnBlindToggle.innerHTML = `<span>👁️</span> <span class="blind-text-desktop">인출 모드 작동 중 (클릭 시 정답)</span><span class="blind-text-mobile">인출 켜짐</span>`;
    } else {
      document.body.classList.remove("blind-mode-active");
      btnBlindToggle.classList.remove("active");
      btnBlindToggle.innerHTML = `<span>👁️</span> <span class="blind-text-desktop">키워드 가리기 (인출 훈련)</span><span class="blind-text-mobile">인출 모드</span>`;
      document.querySelectorAll(".keyword-blind").forEach((el) => el.classList.remove("revealed"));
    }
  });

  // 7. 검색 및 필터 이벤트
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
    renderContent();
  });

  chipP3.addEventListener("click", () => {
    currentFilter = "p3";
    chipP3.classList.add("active");
    chipAll.classList.remove("active");
    renderContent();
  });

  // 8. 포모도로 타이머 로직
  function formatPomo(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function playPomoSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not allowed yet");
    }
  }

  pomoStartBtn.addEventListener("click", () => {
    if (isPomoRunning) {
      clearInterval(pomoTimerId);
      isPomoRunning = false;
      pomoStartBtn.textContent = "▶";
    } else {
      isPomoRunning = true;
      pomoStartBtn.textContent = "⏸";
      pomoTimerId = setInterval(() => {
        if (pomoTime > 0) {
          pomoTime--;
          pomoTimeDisplay.textContent = formatPomo(pomoTime);
        } else {
          clearInterval(pomoTimerId);
          isPomoRunning = false;
          pomoStartBtn.textContent = "▶";
          playPomoSound();
          alert("🎉 25분 집중 세션 완료! 5분간 뇌에 휴식을 선물하세요.");
          pomoTime = 5 * 60; // 휴식 5분 세팅
          pomoTimeDisplay.textContent = formatPomo(pomoTime);
        }
      }, 1000);
    }
  });

  pomoResetBtn.addEventListener("click", () => {
    clearInterval(pomoTimerId);
    isPomoRunning = false;
    pomoTime = 25 * 60;
    pomoTimeDisplay.textContent = formatPomo(pomoTime);
    pomoStartBtn.textContent = "▶";
  });

  // 9. 안티그래비티 딥 블랙 테마 영구 강제 (검은 배경, 흰색 본문, 노란색 포인트)
  document.documentElement.setAttribute("data-theme", "dark");
  localStorage.setItem("counseling_theme", "dark");

  // 10. 태블릿 및 모바일 맞춤형 글자 크기 조절 시스템 (13px ~ 32px 지원)
  function applyFontSize(size) {
    fontSizeLevel = Math.max(13, Math.min(32, size));
    document.documentElement.style.fontSize = `${fontSizeLevel}px`;
    localStorage.setItem("counseling_font_size", fontSizeLevel);

    const pct = Math.round((fontSizeLevel / 16) * 100);
    if (fontSizeDisplay) fontSizeDisplay.textContent = `${pct}%`;
    if (fontPopupPercent) {
      let desc = pct <= 90 ? "작게" : pct === 100 ? "보통" : pct <= 130 ? "태블릿 추천" : pct <= 160 ? "크게" : "특대";
      fontPopupPercent.textContent = `${pct}% (${desc})`;
    }

    if (presetBtns) {
      presetBtns.forEach((btn) => {
        const btnSize = parseInt(btn.getAttribute("data-size"), 10);
        btn.classList.toggle("active", btnSize === fontSizeLevel);
      });
    }
  }

  // 초기 폰트 크기 적용
  applyFontSize(fontSizeLevel);

  // 상단 네비바 글자 크기 버튼
  if (btnFontIncrease) {
    btnFontIncrease.addEventListener("click", () => applyFontSize(fontSizeLevel + 1));
  }
  if (btnFontDecrease) {
    btnFontDecrease.addEventListener("click", () => applyFontSize(fontSizeLevel - 1));
  }
  if (btnFontReset) {
    btnFontReset.addEventListener("click", () => applyFontSize(16));
  }

  // 태블릿 플로팅 퀵 글자 조절기 (Floating Font Popover)
  if (btnFloatFont && fontPopupPanel) {
    btnFloatFont.addEventListener("click", (e) => {
      e.stopPropagation();
      fontPopupPanel.classList.toggle("active");
    });

    if (btnFontPopupClose) {
      btnFontPopupClose.addEventListener("click", (e) => {
        e.stopPropagation();
        fontPopupPanel.classList.remove("active");
      });
    }

    // 팝업 외부 터치 시 닫기
    document.addEventListener("click", (e) => {
      if (
        fontPopupPanel.classList.contains("active") &&
        !fontPopupPanel.contains(e.target) &&
        !btnFloatFont.contains(e.target)
      ) {
        fontPopupPanel.classList.remove("active");
      }
    });
  }

  // 프리셋 버튼 이벤트
  if (presetBtns) {
    presetBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetSize = parseInt(btn.getAttribute("data-size"), 10);
        applyFontSize(targetSize);
      });
    });
  }

  // 팝업 내 스텝 조절 버튼
  if (btnStepperDec) {
    btnStepperDec.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFontSize(fontSizeLevel - 1);
    });
  }
  if (btnStepperInc) {
    btnStepperInc.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFontSize(fontSizeLevel + 1);
    });
  }
  if (btnStepperReset) {
    btnStepperReset.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFontSize(16);
    });
  }

  // 11. 모바일 사이드바 서랍 제어 (배경 클릭, 닫기 버튼, 플로팅 목차 버튼 연동)
  function openSidebar() {
    sidebar.classList.add("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
    document.body.classList.add("sidebar-open-lock");
  }

  function closeSidebar() {
    sidebar.classList.remove("mobile-open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
    document.body.classList.remove("sidebar-open-lock");
  }

  function toggleSidebar() {
    if (sidebar.classList.contains("mobile-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener("click", closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);
  if (btnFloatMenu) btnFloatMenu.addEventListener("click", toggleSidebar);

  // 12. ScrollSpy (스크롤 연동 사이드바 링크 하이라이트)
  window.addEventListener("scroll", () => {
    const fromTop = window.scrollY + 100;
    const cards = document.querySelectorAll(".topic-card");
    let currentId = "";

    cards.forEach((card) => {
      if (card.offsetTop <= fromTop) {
        currentId = card.id;
      }
    });

    if (currentId) {
      document.querySelectorAll(".topic-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("data-target") === currentId) {
          link.classList.add("active");
          // 해당 과목 아코디언 자동으로 열어두기
          const parentGroup = link.closest(".subject-group");
          if (parentGroup && !parentGroup.classList.contains("open")) {
            parentGroup.classList.add("open");
          }
        }
      });
    }
  });

  // 13. URL 해시(#counsel-03 등) 자동 스크롤 연동 (상단 네비바 가림 방지)
  function scrollToHash(immediate = false) {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      try {
        const target = document.querySelector(hash);
        if (target) {
          const navbarHeight = 72;
          const targetY = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({
            top: targetY,
            behavior: immediate ? "auto" : "smooth"
          });
        }
      } catch (e) {
        console.warn("Hash scroll note:", e);
      }
    }
  }

  window.addEventListener("hashchange", () => scrollToHash(false));

  // 초기 실행
  renderSidebar();
  renderContent();
  updateProgress();
  setTimeout(() => scrollToHash(true), 50);
});
