// ゲーム状態
let gameState = {
    currentMonth: 1,
    totalCost: 0,
    warehouse: [],
    orders: [],
    deliveries: [],
    gameLog: [],
    gameHistory: []
};

// 定数
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'];
const materials = [
    { name: '直線線路', price: 100, icon: '━' },
    { name: '曲線線路', price: 200, icon: '╰' },
    { name: '橋', price: 300, icon: '🌉' },
    { name: '踏切', price: 400, icon: '🚧' }
];

// DOM要素
const elements = {
    currentMonth: document.querySelector('.current-month'),
    totalCost: document.querySelector('.total-cost'),
    warehouseCount: document.querySelector('.warehouse-count'),
    warehouseCost: document.querySelector('.warehouse-cost'),
    materialSelect: document.getElementById('material-select'),
    quantityInput: document.getElementById('quantity-input'),
    deliveryMonthSelect: document.getElementById('delivery-month-select'),
    deliveryMonthGroup: document.getElementById('delivery-month-group'),
    deliveryInfo: document.getElementById('delivery-info'),
    deliveryInfoText: document.getElementById('delivery-info-text'),
    orderCost: document.getElementById('order-cost'),
    totalCostPreview: document.getElementById('total-cost-preview'),
    placeOrderBtn: document.getElementById('place-order-btn'),
    emergencyNotice: document.getElementById('emergency-notice'),
    orderForm: document.getElementById('order-form'),
    gameEnded: document.getElementById('game-ended'),
    warehouseContent: document.getElementById('warehouse-content'),
    deliveriesCard: document.getElementById('deliveries-card'),
    deliveriesContent: document.getElementById('deliveries-content'),
    orderTotalCost: document.getElementById('order-total-cost'),
    orderCount: document.getElementById('order-count'),
    warehouseTotalCost: document.getElementById('warehouse-total-cost'),
    currentWarehouseCost: document.getElementById('current-warehouse-cost'),
    progressText: document.getElementById('progress-text'),
    progressFill: document.getElementById('progress-fill'),
    goBackBtn: document.getElementById('go-back-btn'),
    nextMonthBtn: document.getElementById('next-month-btn'),
    gameEndMessage: document.getElementById('game-end-message'),
    finalCost: document.getElementById('final-cost'),
    gameLogCard: document.getElementById('game-log-card'),
    gameLogContent: document.getElementById('game-log-content')
};

// 初期化
function init() {
    updateDisplay();
    updateOrderForm();
    setupEventListeners();
}

// イベントリスナーの設定
function setupEventListeners() {
    elements.materialSelect.addEventListener('change', updateOrderForm);
    elements.quantityInput.addEventListener('input', updateOrderForm);
    elements.deliveryMonthSelect.addEventListener('change', updateOrderForm);
    elements.placeOrderBtn.addEventListener('click', placeOrder);
    elements.goBackBtn.addEventListener('click', goBackOneMonth);
    elements.nextMonthBtn.addEventListener('click', nextMonth);
}

// 表示更新
function updateDisplay() {
    // 基本情報
    elements.currentMonth.textContent = months[gameState.currentMonth - 1];
    elements.totalCost.textContent = `¥${gameState.totalCost.toLocaleString()}`;
    elements.warehouseCount.textContent = `${gameState.warehouse.length}個`;
    elements.warehouseCost.textContent = `月額: ¥${(gameState.warehouse.length * 100).toLocaleString()}`;
    
    // 進行状況
    elements.progressText.textContent = `${gameState.currentMonth}/10ヶ月`;
    elements.progressFill.style.width = `${(gameState.currentMonth / 10) * 100}%`;
    
    // 費用詳細
    const orderCostTotal = gameState.orders.reduce((sum, order) => sum + order.cost, 0);
    const warehouseCostTotal = gameState.totalCost - orderCostTotal;
    
    elements.orderTotalCost.textContent = `¥${orderCostTotal.toLocaleString()}`;
    elements.orderCount.textContent = gameState.orders.length;
    elements.warehouseTotalCost.textContent = `¥${warehouseCostTotal.toLocaleString()}`;
    elements.currentWarehouseCost.textContent = `¥${(gameState.warehouse.length * 100).toLocaleString()}`;
    
    // 戻るボタンの状態
    elements.goBackBtn.disabled = gameState.gameHistory.length === 0;
    
    // ゲーム終了状態
    if (gameState.currentMonth >= 10) {
        elements.nextMonthBtn.style.display = 'none';
        elements.gameEndMessage.style.display = 'block';
        elements.finalCost.textContent = `¥${gameState.totalCost.toLocaleString()}`;
        elements.orderForm.style.display = 'none';
        elements.gameEnded.style.display = 'block';
    } else {
        elements.nextMonthBtn.style.display = 'block';
        elements.gameEndMessage.style.display = 'none';
        elements.orderForm.style.display = 'block';
        elements.gameEnded.style.display = 'none';
    }
    
    updateWarehouseDisplay();
    updateDeliveriesDisplay();
    updateGameLogDisplay();
}

// 発注フォーム更新
function updateOrderForm() {
    const materialIndex = parseInt(elements.materialSelect.value);
    const quantity = parseInt(elements.quantityInput.value) || 1;
    const material = materials[materialIndex];
    
    // 6月以降は緊急発注
    const isEmergencyOrder = gameState.currentMonth >= 6;
    const unitPrice = isEmergencyOrder ? material.price * 2 : material.price;
    const orderCost = unitPrice * quantity;
    
    // 緊急発注通知
    elements.emergencyNotice.style.display = isEmergencyOrder ? 'block' : 'none';
    
    // 配送月の表示切り替え
    if (gameState.currentMonth <= 5) {
        elements.deliveryMonthGroup.style.display = 'block';
        elements.deliveryInfo.style.display = 'none';
    } else {
        elements.deliveryMonthGroup.style.display = 'none';
        elements.deliveryInfo.style.display = 'block';
        const deliveryMonth = gameState.currentMonth + 1;
        elements.deliveryInfoText.textContent = deliveryMonth <= 10 ? `${deliveryMonth}月` : '配送不可';
    }
    
    // 資材選択肢の価格更新
    materials.forEach((mat, index) => {
        const currentPrice = isEmergencyOrder ? mat.price * 2 : mat.price;
        const priceLabel = isEmergencyOrder ? `¥${currentPrice} (通常¥${mat.price})` : `¥${currentPrice}`;
        elements.materialSelect.options[index].textContent = `${mat.name} (${priceLabel})`;
    });
    
    // 費用プレビュー
    elements.orderCost.textContent = `¥${orderCost.toLocaleString()}`;
    if (isEmergencyOrder) {
        elements.orderCost.innerHTML += ' <span style="color: #dc2626; font-size: 0.75rem;">(緊急発注価格)</span>';
    }
    elements.totalCostPreview.textContent = `¥${(gameState.totalCost + orderCost).toLocaleString()}`;
    
    // ボタンの状態
    const canDeliver = gameState.currentMonth <= 5 || (gameState.currentMonth >= 6 && gameState.currentMonth + 1 <= 10);
    elements.placeOrderBtn.disabled = !canDeliver;
    elements.placeOrderBtn.textContent = canDeliver ? '発注する' : '配送期間終了';
}

// 発注処理
function placeOrder() {
    const materialIndex = parseInt(elements.materialSelect.value);
    const quantity = parseInt(elements.quantityInput.value) || 1;
    const material = materials[materialIndex];
    
    // 6月以降は価格2倍
    const unitPrice = gameState.currentMonth >= 6 ? material.price * 2 : material.price;
    const orderCost = unitPrice * quantity;
    
    // 6月以降の発注は翌月配送
    const deliveryMonth = gameState.currentMonth >= 6 ? gameState.currentMonth + 1 : parseInt(elements.deliveryMonthSelect.value);
    
    if (deliveryMonth > 10) {
        alert('10月以降には配送できません！');
        return;
    }
    
    if (gameState.currentMonth > 5 && deliveryMonth < gameState.currentMonth) {
        alert('過去の月には配送できません！');
        return;
    }
    
    gameState.totalCost += orderCost;
    
    const newOrder = {
        id: Date.now(),
        month: gameState.currentMonth,
        material: materialIndex,
        quantity: quantity,
        cost: orderCost,
        deliveryMonth: deliveryMonth,
        unitPrice: unitPrice
    };
    
    gameState.orders.push(newOrder);
    
    // 配送予定に追加
    gameState.deliveries.push({
        month: deliveryMonth,
        material: materialIndex,
        quantity: quantity
    });
    
    const priceNote = gameState.currentMonth >= 6 ? '（緊急発注価格）' : '';
    addGameLog('order', `${material.name} ${quantity}個を発注${priceNote}（${deliveryMonth}月配送予定）: ¥${orderCost.toLocaleString()}`);
    
    // フォームリセット
    elements.quantityInput.value = 1;
    elements.deliveryMonthSelect.value = Math.max(6, gameState.currentMonth);
    
    updateDisplay();
    updateOrderForm();
}

// 状態保存
function saveGameState() {
    const state = {
        currentMonth: gameState.currentMonth,
        totalCost: gameState.totalCost,
        warehouse: [...gameState.warehouse],
        orders: [...gameState.orders],
        deliveries: [...gameState.deliveries],
        gameLog: [...gameState.gameLog]
    };
    gameState.gameHistory.push(state);
}

// 一か月前に戻る
function goBackOneMonth() {
    if (gameState.gameHistory.length === 0) {
        alert('戻れる履歴がありません！');
        return;
    }
    
    const lastState = gameState.gameHistory[gameState.gameHistory.length - 1];
    gameState.currentMonth = lastState.currentMonth;
    gameState.totalCost = lastState.totalCost;
    gameState.warehouse = lastState.warehouse;
    gameState.orders = lastState.orders;
    gameState.deliveries = lastState.deliveries;
    gameState.gameLog = lastState.gameLog;
    
    // 履歴から最後の状態を削除
    gameState.gameHistory.pop();
    
    // ログ追加
    addGameLog('undo', '一か月前に戻りました');
    
    updateDisplay();
    updateOrderForm();
}

// 次の月に進む
function nextMonth() {
    if (gameState.currentMonth >= 10) return;
    
    // 現在の状態を保存
    saveGameState();
    
    // 倉庫代計算
    const warehouseCost = gameState.warehouse.length * 100;
    gameState.totalCost += warehouseCost;
    
    // 配送処理
    const currentDeliveries = gameState.deliveries.filter(d => d.month === gameState.currentMonth + 1);
    if (currentDeliveries.length > 0) {
        const newItems = [];
        currentDeliveries.forEach(delivery => {
            for (let i = 0; i < delivery.quantity; i++) {
                newItems.push({
                    id: Date.now() + Math.random(),
                    material: delivery.material,
                    deliveredMonth: gameState.currentMonth + 1
                });
            }
        });
        gameState.warehouse.push(...newItems);
        
        // ログ追加
        addGameLog('delivery', `${currentDeliveries.map(d => `${materials[d.material].name} ${d.quantity}個`).join(', ')}が納品されました`);
    }
    
    // 配送予定から完了分を削除
    gameState.deliveries = gameState.deliveries.filter(d => d.month !== gameState.currentMonth + 1);
    
    if (warehouseCost > 0) {
        addGameLog('cost', `倉庫代: ¥${warehouseCost.toLocaleString()}`);
    }
    
    gameState.currentMonth++;
    
    updateDisplay();
    updateOrderForm();
}

// 倉庫表示更新
function updateWarehouseDisplay() {
    if (gameState.warehouse.length === 0) {
        elements.warehouseContent.innerHTML = `
            <div class="empty-warehouse">
                <div class="empty-icon">📦</div>
                <p>倉庫は空です</p>
            </div>
        `;
        return;
    }
    
    // 在庫をグループ化
    const groupedWarehouse = gameState.warehouse.reduce((acc, item) => {
        const key = item.material;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
    
    let html = '<div class="warehouse-items">';
    
    Object.entries(groupedWarehouse).forEach(([materialIndex, items]) => {
        const material = materials[materialIndex];
        html += `
            <div class="warehouse-item">
                <div class="warehouse-item-header">
                    <h3 class="warehouse-item-title">${material.icon} ${material.name}</h3>
                    <span class="warehouse-item-count">${items.length}個</span>
                </div>
                <div class="warehouse-item-actions">
                    ${items.map(item => `
                        <button class="remove-btn" data-item-id="${item.id}">出庫</button>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    elements.warehouseContent.innerHTML = html;
    
    // イベントリスナーを再設定
    const removeButtons = elements.warehouseContent.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            removeFromWarehouse(itemId);
        });
    });
}

// 倉庫から出す（グローバル関数として定義）
window.removeFromWarehouse = function(id) {
    const item = gameState.warehouse.find(w => w.id === id);
    if (item) {
        gameState.warehouse = gameState.warehouse.filter(w => w.id !== id);
        addGameLog('remove', `${materials[item.material].name}を倉庫から出しました`);
        updateDisplay();
    }
}

// 配送予定表示更新
function updateDeliveriesDisplay() {
    if (gameState.deliveries.length === 0) {
        elements.deliveriesCard.style.display = 'none';
        return;
    }
    
    elements.deliveriesCard.style.display = 'block';
    
    let html = '';
    gameState.deliveries.forEach((delivery, index) => {
        const material = materials[delivery.material];
        html += `
            <div class="delivery-item">
                <p>${delivery.month}月配送予定</p>
                <p>${material.icon} ${material.name} × ${delivery.quantity}個</p>
            </div>
        `;
    });
    
    elements.deliveriesContent.innerHTML = html;
}

// ゲームログ表示更新
function updateGameLogDisplay() {
    if (gameState.gameLog.length === 0) {
        elements.gameLogCard.style.display = 'none';
        return;
    }
    
    elements.gameLogCard.style.display = 'block';
    
    let html = '';
    gameState.gameLog.slice(-10).reverse().forEach(log => {
        html += `
            <div class="log-entry ${log.type}">
                <span class="log-month">${months[log.month - 1]}:</span> ${log.message}
            </div>
        `;
    });
    
    elements.gameLogContent.innerHTML = html;
}

// ゲームログ追加
function addGameLog(type, message) {
    gameState.gameLog.push({
        month: gameState.currentMonth,
        type: type,
        message: message
    });
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
