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
const screenResult = document.getElementById("screen-result");

const btnStart = document.getElementById("btn-start");
const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");

const quizCard = document.getElementById("quiz-card");
const quizQuestionEl = document.getElementById("quiz-question");

const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");
const progressBarWrap = document.getElementById("progress-bar-wrap");

const fixedCta = document.getElementById("fixed-cta");

// ============================================================
// 画面切り替え共通関数
// 全画面を一旦非表示にし、対象画面だけ表示してアニメーションをやり直す
// ============================================================
function showScreen(targetScreen) {
  [screenTop, screenQuiz, screenResult].forEach((screen) => {
    screen.classList.remove("screen--active");
  });

  // アニメーションを再トリガーするため、reflowを挟む
  void targetScreen.offsetWidth;

  targetScreen.classList.add("screen--active");
}

// ============================================================
// プログレスバー更新
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
  quizCard.classList.remove("screen--active"); // 念のため
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
    // 最終問終了 → 結果画面へ（診断ロジックなし、常にエニピル表示）
    goToResult();
  }
}

// ============================================================
// 結果画面表示
// ============================================================
function goToResult() {
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
