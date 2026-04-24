// ブラックジャック - Black Jack Game
// ルール: 2-10は数字通り、J/Q/Kは10点、Aは1または11点

let deck = [];
let playerHand = [];
let dealerHand = [];
let chips = 1000;
let currentBet = 0;
let isGameOver = true;
let canDouble = true;
let gamesPlayed = 0; // 試合数カウンター
let gamesWon = 0; // 勝利数カウンター

// デッキ作成とシャッフル
function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    deck = [];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            let value;
            if (rank === "A") {
                value = 11; // Aは最初は11として計算
            } else if (["J", "Q", "K"].includes(rank)) {
                value = 10;
            } else {
                value = parseInt(rank);
            }
            deck.push({ 
                display: suit + rank, 
                value: value, 
                rank: rank,
                suit: suit
            });
        }
    }
    
    // フィッシャー・イェーツのシャッフル
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// スコア計算（Aを1または11として有利な方を選択）
function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        score += card.value;
        if (card.rank === "A") {
            aces++;
        }
    }
    
    // Aを1として計算し直す
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// スコア表示用（Aがある場合は、異なるスコアになる場合のみ両方表示）
function getScoreDisplay(hand) {
    let hasAce = hand.some(card => card.rank === "A");
    
    if (!hasAce) {
        return calculateScore(hand).toString();
    }
    
    // Aを1として計算
    let scoreWithAceAs1 = 0;
    for (let card of hand) {
        if (card.rank === "A") {
            scoreWithAceAs1 += 1;
        } else {
            scoreWithAceAs1 += card.value;
        }
    }
    
    // Aを11として計算（1つだけAを11に変更）
    let scoreWithAceAs11 = scoreWithAceAs1 + 10;
    
    // scoreWithAceAs11が21以下ならそちらを使う（有利な方を選択）
    if (scoreWithAceAs11 <= 21) {
        // 両者が異なる場合のみ両方表示
        if (scoreWithAceAs1 !== scoreWithAceAs11) {
            return `${scoreWithAceAs11} (or ${scoreWithAceAs1})`;
        } else {
            return scoreWithAceAs11.toString();
        }
    } else {
        // scoreWithAceAs11が21超えなら、scoreWithAceAs1だけ
        return scoreWithAceAs1.toString();
    }
}

// ベット配置
function placeBet() {
    const betInput = document.getElementById("bet-amount");
    const bet = parseInt(betInput.value);
    
    // 入力値の検証
    if (isNaN(bet) || bet < 10) {
        alert("10以上の有効な賭け金を入力してください");
        return;
    }
    
    if (bet > chips) {
        alert("所持チップが足りません");
        return;
    }
    
    // ベット処理
    currentBet = bet;
    chips -= bet;
    canDouble = true;
    
    // UI更新：ベッティングパネルを非表示、ゲームコントロールを表示
    document.getElementById("betting-panel").style.display = "none";
    document.getElementById("game-controls").style.display = "flex";
    document.getElementById("bet-display").style.display = "block";
    document.getElementById("current-bet").innerText = currentBet;
    document.getElementById("chips").innerText = chips;
    
    // ゲーム開始
    startGame();
}

// ゲーム開始
function startGame() {
    // デッキが少なくなったら新しくシャッフル
    if (deck.length < 20) {
        createDeck();
    }
    
    // プレイヤーとディーラーに2枚ずつ配る
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    
    isGameOver = false;
    
    // ボタン有効化
    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stand-btn").disabled = false;
    document.getElementById("double-btn").disabled = false;
    
    document.getElementById("message").innerText = "アクションを選択してください";
    
    // 初期表示
    updateUI(false);
    
    // ブラックジャック（21）チェック
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    
    if (playerScore === 21 && playerHand.length === 2) {
        if (dealerScore === 21 && dealerHand.length === 2) {
            // プレイヤーもディーラーもブラックジャック
            endGame("プッシュ（引き分け）", null);
        } else {
            // プレイヤーのみブラックジャック
            endGame("ブラックジャック！1.5倍の配当で勝利！", true);
        }
    }
}

// ヒット（カードを追加）
function hit() {
    playerHand.push(deck.pop());
    const score = calculateScore(playerHand);
    
    updateUI(false);
    
    if (score > 21) {
        // バースト時もディーラーのカードを全て表示
        endGameWithDealerReveal("バースト！あなたの負けです", false);
    } else if (score === 21) {
        document.getElementById("message").innerText = "21になりました";
    }
}

// スタンド（ディーラーと対戦）
function stand() {
    disableGameButtons();
    document.getElementById("message").innerText = "ディーラーのターン...";
    
    // ディーラーのターンを開始（遅延処理）
    setTimeout(dealerPlay, 1000);
}

// ディーラーのカードを一枚ずつ引く
function dealerPlay() {
    const dealerScore = calculateScore(dealerHand);
    
    // ディーラーが17未満の場合はカードを引く
    if (dealerScore < 17) {
        // カードを1枚引く
        dealerHand.push(deck.pop());
        const newScore = calculateScore(dealerHand);
        
        // UI更新（ディーラーのカードを表示）
        updateUI(false);
        
        // メッセージ更新
        document.getElementById("message").innerText = `ディーラーは ${getScoreDisplay(dealerHand)} を引きました...`;
        
        // 次のカードを引く（1秒後）
        setTimeout(dealerPlay, 1000);
    } else {
        // ディーラーが17以上になったので勝負結果を判定
        finishGame();
    }
}

// ゲーム結果を判定
function finishGame() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    
    document.getElementById("message").innerText = `最終スコア - あなた: ${getScoreDisplay(playerHand)} vs ディーラー: ${getScoreDisplay(dealerHand)}`;
    
    // 結果判定
    if (dealerScore > 21) {
        endGame("ディーラーバースト！あなたの勝ちです！", true);
    } else if (playerScore > dealerScore) {
        endGame("あなたの勝ちです！", true);
    } else if (playerScore < dealerScore) {
        endGame("ディーラーの勝ちです", false);
    } else {
        endGame("プッシュ（引き分け）", null);
    }
}

// ダブルダウン（賭け金を2倍にして1枚だけ引く）
function doubleDown() {
    if (!canDouble) return;
    
    if (currentBet > chips) {
        alert("ダブルダウンできません（チップ不足）");
        return;
    }
    
    // 賭け金を2倍に
    chips -= currentBet;
    currentBet *= 2;
    canDouble = false;
    
    // カードを1枚引く
    playerHand.push(deck.pop());
    const score = calculateScore(playerHand);
    
    updateUI(false);
    
    if (score > 21) {
        // バースト時もディーラーのカードを全て表示
        endGameWithDealerReveal("バースト！あなたの負けです", false);
    } else {
        // 自動的にスタンド
        stand();
    }
}

// ゲーム終了（ディーラーのカード表示版 - バースト時用）
function endGameWithDealerReveal(baseMessage, playerWin) {
    isGameOver = true;
    disableGameButtons();
    
    // ディーラーのカードを全て表示
    updateUI(true);
    
    // メッセージにディーラーのスコアも含める
    const dealerScore = calculateScore(dealerHand);
    const message = `${baseMessage} (ディーラーのスコア: ${getScoreDisplay(dealerHand)})`;
    
    // チップの計算
    if (playerWin === true) {
        // プレイヤー勝利
        if (calculateScore(playerHand) === 21 && playerHand.length === 2) {
            // ブラックジャックボーナス（1.5倍）
            chips += Math.floor(currentBet * 2.5);
        } else {
            // 通常勝利（2倍返金）
            chips += currentBet * 2;
        }
    } else if (playerWin === null) {
        // プッシュ（引き分け）
        chips += currentBet;
    }
    // playerWin === false の場合は何もしない（賭け金没収）
    
    // 試合数をインクリメント
    gamesPlayed++;
    
    // 勝利数をカウント
    if (playerWin === true) {
        gamesWon++;
    }
    
    // UI更新
    document.getElementById("games-played").innerText = gamesPlayed;
    document.getElementById("games-won").innerText = gamesWon;
    
    // 勝率を計算して表示
    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    document.getElementById("win-rate").innerText = winRate;
    
    document.getElementById("message").innerText = message;
    document.getElementById("chips").innerText = chips;
    
    // チップ尽きたか確認
    if (chips <= 0) {
        document.getElementById("message").innerText = message + " - ゲームオーバー（チップ切れ）";
    }
}

// ゲーム終了
function endGame(message, playerWin) {
    isGameOver = true;
    disableGameButtons();
    
    // チップの計算
    if (playerWin === true) {
        // プレイヤー勝利
        if (calculateScore(playerHand) === 21 && playerHand.length === 2) {
            // ブラックジャックボーナス（1.5倍）
            chips += Math.floor(currentBet * 2.5);
        } else {
            // 通常勝利（2倍返金）
            chips += currentBet * 2;
        }
    } else if (playerWin === null) {
        // プッシュ（引き分け）
        chips += currentBet;
    }
    // playerWin === false の場合は何もしない（賭け金没収）
    
    // 試合数をインクリメント
    gamesPlayed++;
    
    // 勝利数をカウント
    if (playerWin === true) {
        gamesWon++;
    }
    
    // UI更新
    document.getElementById("games-played").innerText = gamesPlayed;
    document.getElementById("games-won").innerText = gamesWon;
    
    // 勝率を計算して表示
    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    document.getElementById("win-rate").innerText = winRate;
    
    document.getElementById("message").innerText = message;
    updateUI(true);
    document.getElementById("chips").innerText = chips;
    
    // チップ尽きたか確認
    if (chips <= 0) {
        document.getElementById("message").innerText = message + " - ゲームオーバー（チップ切れ）";
    }
}

// ゲームボタン無効化
function disableGameButtons() {
    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stand-btn").disabled = true;
    document.getElementById("double-btn").disabled = true;
}

// UI更新
function updateUI(reveal) {
    const playerHandDiv = document.getElementById("player-hand");
    const dealerHandDiv = document.getElementById("dealer-hand");
    
    // プレイヤーの手札表示
    playerHandDiv.innerHTML = playerHand.map(card => {
        const isRed = card.suit === "♥" || card.suit === "♦";
        return `<div class="card ${isRed ? "red" : "black"}">${card.display}</div>`;
    }).join("");
    
    // ディーラーの手札表示
    if (reveal) {
        // ゲーム終了時：全カードを表示
        dealerHandDiv.innerHTML = dealerHand.map(card => {
            const isRed = card.suit === "♥" || card.suit === "♦";
            return `<div class="card ${isRed ? "red" : "black"}">${card.display}</div>`;
        }).join("");
        document.getElementById("dealer-score").innerText = getScoreDisplay(dealerHand);
    } else {
        // ゲーム中：1枚目は表示、2枚目は伏せる
        const firstCard = dealerHand[0];
        const isRed = firstCard.suit === "♥" || firstCard.suit === "♦";
        dealerHandDiv.innerHTML = `
            <div class="card ${isRed ? "red" : "black"}">${firstCard.display}</div>
            <div class="card back">🂠</div>
        `;
        document.getElementById("dealer-score").innerText = firstCard.value;
    }
    
    // スコア表示
    document.getElementById("player-score").innerText = getScoreDisplay(playerHand);
}

// ゲームリセット
function resetGame() {
    playerHand = [];
    dealerHand = [];
    currentBet = 0;
    isGameOver = true;
    
    document.getElementById("message").innerText = "チップを賭えてゲームを開始してください";
    document.getElementById("player-hand").innerHTML = "";
    document.getElementById("dealer-hand").innerHTML = "";
    document.getElementById("player-score").innerText = "0";
    document.getElementById("dealer-score").innerText = "?";
    document.getElementById("chips").innerText = chips;
    
    // UI更新：ゲームコントロールを非表示、ベッティングパネルを表示
    document.getElementById("game-controls").style.display = "none";
    document.getElementById("betting-panel").style.display = "flex";
    document.getElementById("bet-display").style.display = "none";
    document.getElementById("bet-amount").value = "100";
    disableGameButtons();
    
    // チップが0になったらゲーム終了
    if (chips <= 0) {
        alert("ゲームオーバー。チップが切れました。");
        chips = 1000;
        document.getElementById("chips").innerText = chips;
        document.getElementById("message").innerText = "チップをリセットしました。新しいゲームを開始してください";
    }
}

// 初期化（ページロード時にデッキを作成）
window.addEventListener("load", function() {
    createDeck();
});
