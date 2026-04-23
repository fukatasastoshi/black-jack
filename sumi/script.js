// DOM要素を取得
const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');
const bettingScreen = document.getElementById('bettingScreen');
const gameScreen = document.getElementById('gameScreen');

const betSlider = document.getElementById('betSlider');
const betSpinner = document.getElementById('betSpinner');
const currentBetAmount = document.getElementById('currentBetAmount');
const confirmButton = document.getElementById('confirmButton');

// ============ スライダーとスピナーの連動 ============
// スライダーの値が変わった時
betSlider.addEventListener('input', function() {
    const value = this.value;
    betSpinner.value = value;
    updateBetDisplay(value);
});

// スピナーの値が変わった時
betSpinner.addEventListener('input', function() {
    const value = this.value;
    betSlider.value = value;
    updateBetDisplay(value);
});

// 掛け金表示を更新
function updateBetDisplay(value) {
    currentBetAmount.textContent = value;
}

// ============ 画面遷移処理 ============
// ゲームスタートボタンをクリック
startButton.addEventListener('click', function() {
    // スタート画面を非表示、掛け金画面を表示
    startScreen.classList.remove('active');
    bettingScreen.classList.add('active');
});

// 確定ボタンをクリック
confirmButton.addEventListener('click', function() {
    const betAmount = betSpinner.value;
    console.log('掛け金が決定されました:', betAmount);
    
    // 掛け金画面を非表示、ゲーム画面を表示
    bettingScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // ここからゲーム開始処理をおこなう
    startGame(betAmount);
});

// ゲーム開始関数（今後実装）
function startGame(betAmount) {
    console.log('ゲーム開始。掛け金: ¥' + betAmount);
    // ここにゲームロジックを実装します
}

// 初期化
window.addEventListener('load', function() {
    console.log('ブラックジャック - 初期化完了');
    updateBetDisplay(100);
});
