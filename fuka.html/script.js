//  블랙잭ゲーム - 完全版
// ルール: 2-10は数字通り、J/Q/Kは10点、Aは1または11点

let deck = [];
let playerHand = [];
let dealerHand = [];
let chips = 1000;
let currentBet = 0;
let isGameOver = true;
let canDouble = true;

// デッキ作成
function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    deck = [];
    for (let s of suits) {
        for (let r of ranks) {
            let val;
            if (r === "A") {
                val = 11; // Aは最初は11として計算
            } else if (["J", "Q", "K"].includes(r)) {
                val = 10;
            } else {
                val = parseInt(r);
            }
            deck.push({ display: s + r, value: val, rank: r });
        }
    }
    // シャッフル
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// スコア計算（Aを1または11として有利な方を選択）
function calculateScore(hand) {
    let score = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(c => c.rank === "A").length;
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

// ベット配置
function placeBet() {
    const betInput = document.getElementById("bet-amount");
    const bet = parseInt(betInput.value);
    
    if (isNaN(bet) || bet < 1) {
        alert("有効な賭け金を入力してください");
        return;
    }
    if (bet > chips) {
        alert("所持チップが足りません");
        return;
    }
    
    currentBet = bet;
    chips -= bet;
    canDouble = true;
    
    startGame();
}

// ゲーム開始
function startGame() {
    if (deck.length < 20) {
        createDeck();
    }
    
    // プレイヤーとディーラーに2枚ずつ配る
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    
    isGameOver = false;
    
    // ボタンの有効化
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    document.getElementById("double-btn").disabled = false;
    
    document.getElementById("message").innerText = "アクションを選択してください";
    
    // ブラックジャックチェック
    const pScore = calculateScore(playerHand);
    if (pScore === 21) {
        // プレイヤーもブラックジャックの場合
        const dScore = calculateScore(dealerHand);
        if (dScore === 21) {
            endGame("プッシュ（引き分け）", false);
        } else {
            endGame("ブラックジャック！1.5倍の配当", true);
        }
        return;
    }
    
    updateUI(false);
}

// ヒット（カードを追加）
function hit() {
    playerHand.push(deck.pop());
    const score = calculateScore(playerHand);
    
    if (score > 21) {
        endGame("バースト！あなたの負けです", false);
    } else {
        updateUI(false);
    }
}

// スタンド（ディーラーとの勝負）
function stand() {
    // ディーラーは17以上になるまで引く
    while (calculateScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    
    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(dealerHand);
    
    if (dScore > 21) {
        endGame("ディーラーバースト！あなたの勝ちです！", true);
    } else if (pScore > dScore) {
        endGame("あなたの勝ちです！", true);
    } else if (pScore < dScore) {
        endGame("ディーラーの勝ちです", false);
    } else {
        endGame("プッシュ（引き分け）", false);
    }
}

// ダブルダウン（賭け金を2倍にして1枚だけ引く）
function doubleDown() {
    if (!canDouble) return;
    if (currentBet > chips) {
        alert("ダブルダウンできません（チップ不足）");
        return;
    }
    
    chips -= currentBet;
    currentBet *= 2;
    canDouble = false;
    
    playerHand.push(deck.pop());
    const score = calculateScore(playerHand);
    
    if (score > 21) {
        endGame("バースト！あなたの負けです", false);
    } else {
        stand(); // 自動スタンド
    }
}

// ゲーム終了
function endGame(msg, win) {
    isGameOver = true;
    document.getElementById("message").innerText = msg;
    
    // ボタンを無効化
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("double-btn").disabled = true;
    
    if (win) {
        chips += currentBet * 2;
    } else if (msg.includes("プッシュ")) {
        chips += currentBet; // 返金
    }
    
    updateUI(true);
}

// UI更新
function updateUI(reveal) {
    const pHandDiv = document.getElementById("player-hand");
    const dHandDiv = document.getElementById("dealer-hand");
    
    // プレイヤーの手札表示
    pHandDiv.innerHTML = playerHand.map(c => 
        `<div class="card">${c.display}</div>`
    ).join("");
    
    // ディーラーの手札表示
    if (reveal) {
        dHandDiv.innerHTML = dealerHand.map(c => 
            `<div class="card">${c.display}</div>`
        ).join("");
        document.getElementById("dealer-score").innerText = calculateScore(dealerHand);
    } else {
        // 1枚目は表示、2枚目は伏せる
        dHandDiv.innerHTML = `
            <div class="card">${dealerHand[0].display}</div>
            <div class="card back"></div>
        `;
        document.getElementById("dealer-score").innerText = "?";
    }
    
    // スコア表示
    document.getElementById("player-score").innerText = calculateScore(playerHand);
    document.getElementById("chips").innerText = chips;
}

// 新しいゲーム（リセット）
function resetGame() {
    playerHand = [];
    dealerHand = [];
    currentBet = 0;
    isGameOver = true;
    
    document.getElementById("message").innerText = "チップを賭けてゲームを開始してください";
    document.getElementById("player-hand").innerHTML = "";
    document.getElementById("dealer-hand").innerHTML = "";
    document.getElementById("player-score").innerText = "0";
    document.getElementById("dealer-score").innerText = "?";
    
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("double-btn").disabled = true;
}