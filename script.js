// ============================================================
// 診断LP ロジック
// 後から質問を追加したい場合は questions 配列に
// { question: "質問文" } を追加するだけでOK
// ============================================================

const questions = [
  { question: "私は30歳以下の女性だ" },
  { question: "自分に合ったピルを選びたい" },
  { question: "価格は高くても良い" },
  { question: "病院に行く時間は短縮したい" },
  { question: "安心できるサービスがいい" },
];

// 解析演出画面のプログレス値（0% → 100%）
const LOADING_PROGRESS_STEPS = [0, 25, 48, 76, 100];
// 解析演出の合計時間（約1.5秒）
const LOADING_TOTAL_DURATION = 1500;

// 結果タイプ（今回は分岐ロジックなしのため固定値だが、
// 将来的に answers の内容で出し分けたい場合はここを拡張する）
const RESULT_TYPE = {
  name: "【安心・時短重視タイプ】",
  desc: "あなたは、安心して利用できることと、忙しい毎日でも無理なく続けられるサービスを重視する傾向があります。",
};

// 回答を保持する配列（分岐ロジックには使用しないが、
// 将来的な拡張・計測のために保持しておく）
const answers = [];

// 現在の質問インデックス
let currentIndex = 0;

// ============================================================
// 要素取得
// ============================================================
const screenTop = document.getElementById("screen-top");
const screenQuiz = document.getElementById("screen-quiz");
const screenLoading = document.getElementById("screen-loading");
const screenResult = document.getElementById("screen-result");

const allScreens = [screenTop, screenQuiz, screenLoading, screenResult];

const btnStart = document.getElementById("btn-start");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");

const quizCard = document.getElementById("quiz-card");
const quizQuestionEl = document.getElementById("quiz-question");

const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");
const progressBarWrap = document.getElementById("progress-bar-wrap");

const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingPercent = document.getElementById("loading-percent");
const loadingBarWrap = document.getElementById("loading-bar-wrap");
const loadingSteps = document.querySelectorAll(".loading__step");

const typeCardName = document.getElementById("type-card-name");
const typeCardDesc = document.getElementById("type-card-desc");

const fixedCta = document.getElementById("fixed-cta");

// ============================================================
// 画面切り替え共通関数
// 全画面を一旦非表示にし、対象画面だけ表示してアニメーションをやり直す
// ============================================================
function showScreen(targetScreen) {
  allScreens.forEach((screen) => {
    screen.classList.remove("screen--active");
  });

  // アニメーションを再トリガーするため、reflowを挟む
  void targetScreen.offsetWidth;

  targetScreen.classList.add("screen--active");
}

// ============================================================
// プログレスバー更新（診断質問画面）
// ============================================================
function updateProgress() {
  const total = questions.length;
  const current = currentIndex + 1;
  progressLabel.textContent = `質問 ${current} / ${total}`;

  const percent = (current / total) * 100;
  progressFill.style.width = `${percent}%`;
  progressBarWrap.setAttribute("aria-valuenow", String(Math.round(percent)));
}

// ============================================================
// 質問カードの中身を差し替え（フェード＋スライドアップ演出）
// ============================================================
function renderQuestion() {
  const q = questions[currentIndex];
  quizQuestionEl.textContent = q.question;
  updateProgress();

  // カードのアニメーションを再トリガー
  quizCard.style.animation = "none";
  void quizCard.offsetWidth;
  quizCard.style.animation = "";
}

// ============================================================
// 回答処理（YES / NOどちらでも次へ進む。分岐はしない）
// ============================================================
function handleAnswer(value) {
  answers.push({
    questionIndex: currentIndex,
    question: questions[currentIndex].question,
    answer: value, // "yes" or "no"
  });

  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    // 最終問終了 → 解析演出画面へ
    showLoading();
  }
}

// ============================================================
// ① 解析演出画面の表示
// プログレスバーと分析ステップを順番にアニメーションさせ、
// 約1.5秒後に結果画面へ自動遷移する
// ============================================================
function showLoading() {
  showScreen(screenLoading);

  // 状態をリセット
  loadingBarFill.style.width = "0%";
  loadingPercent.textContent = "0%";
  loadingBarWrap.setAttribute("aria-valuenow", "0");
  loadingSteps.forEach((step) => step.classList.remove("loading__step--visible"));

  const stepCount = LOADING_PROGRESS_STEPS.length - 1; // 4ステップ
  const intervalTime = LOADING_TOTAL_DURATION / stepCount;

  LOADING_PROGRESS_STEPS.forEach((percent, i) => {
    setTimeout(() => {
      // プログレスバー更新
      loadingBarFill.style.width = `${percent}%`;
      loadingPercent.textContent = `${percent}%`;
      loadingBarWrap.setAttribute("aria-valuenow", String(percent));

      // 対応する分析ステップを表示（0%の初期表示分はスキップ）
      if (i > 0 && loadingSteps[i - 1]) {
        loadingSteps[i - 1].classList.add("loading__step--visible");
      }
    }, intervalTime * i);
  });

  // 解析演出終了後、結果画面へ
  setTimeout(() => {
    showResult();
  }, LOADING_TOTAL_DURATION + 150); // 最後の表示が見える余白を少し追加
}

// ============================================================
// ② タイプ診断カードの内容を描画
// ============================================================
function renderTypeCard() {
  typeCardName.textContent = RESULT_TYPE.name;
  typeCardDesc.textContent = RESULT_TYPE.desc;
}

// ============================================================
// 結果画面表示（タイプカード描画＋固定CTA表示）
// ============================================================
function showResult() {
  renderTypeCard();
  showScreen(screenResult);

  // 固定CTAを表示
  fixedCta.classList.add("fixed-cta--visible");
  fixedCta.setAttribute("aria-hidden", "false");
}

// ============================================================
// イベント登録
// ============================================================

// 診断スタート
btnStart.addEventListener("click", () => {
  currentIndex = 0;
  renderQuestion();
  showScreen(screenQuiz);
});

// YES / NO 共通
btnYes.addEventListener("click", () => handleAnswer("yes"));
btnNo.addEventListener("click", () => handleAnswer("no"));

// ============================================================
// 初期表示時、固定CTAは非表示にしておく
// ============================================================
fixedCta.classList.remove("fixed-cta--visible");
fixedCta.setAttribute("aria-hidden", "true");

