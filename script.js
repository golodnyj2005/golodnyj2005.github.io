const numbersDiv = document.getElementById('numbers');
let numbers = Array(12).fill(false); // false - свободен, true - занят

// Отображение номеров
function renderNumbers() {
    numbersDiv.innerHTML = '';
    numbers.forEach((taken, i) => {
        const num = document.createElement('div');
        num.className = `number ${taken ? 'taken' : ''}`;
        num.textContent = i + 1;
        if (!taken) num.onclick = () => chooseNumber(i + 1);
        numbersDiv.appendChild(num);
    });
}

// Выбор номера
function chooseNumber(num) {
    Telegram.WebApp.sendData(JSON.stringify({ action: 'choose', number: num }));
    // Локально обновляем, но ждем подтверждения от бэкенда
}

// Обновление состояния номеров
function updateNumbers(takenNumbers) {
    numbers = Array(12).fill(false);
    takenNumbers.forEach(num => {
        numbers[num - 1] = true;
    });
    renderNumbers();
}

// Анимация вращения
function spinRoulette(winner) {
    const arrow = document.getElementById('arrow');
    let angle = 0;
    const targetAngle = (360 / 12) * (winner - 1);
    const spin = setInterval(() => {
        angle += 10;
        arrow.style.transform = `rotate(${angle}deg)`;
        if (angle >= targetAngle + 720) { // 2 полных оборота + остановка
            clearInterval(spin);
            Telegram.WebApp.showAlert(`Победитель: номер ${winner}!`);
        }
    }, 20);
}

// Инициализация Telegram Web App
Telegram.WebApp.ready();
Telegram.WebApp.expand();
renderNumbers();

// Тестовый механизм для получения данных из чата (временный)
Telegram.WebApp.onEvent('web_app_data', (event) => {
    console.log('Получены данные:', event.data);
    const data = JSON.parse(event.data);
    if (data.action === 'update') {
        updateNumbers(data.numbers);
    } else if (data.action === 'spin') {
        spinRoulette(data.winner);
    }
});

// Пока нет Webhook, используем таймер для теста (удали позже)
setInterval(() => {
    // Симуляция получения данных от бота
    // В реальном проекте это будет через Webhook или polling
}, 1000);
