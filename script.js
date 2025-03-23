document.addEventListener("DOMContentLoaded", async () => {
    const numbersGrid = document.getElementById("numbers-grid");
    const startButton = document.getElementById("start-roulette");
    const spinSound = document.getElementById("spin-sound");
    const selectSound = document.getElementById("select-sound");
    const counterElement = document.getElementById("counter");
    const winnerMessage = document.getElementById("winner-message");

    let selectedNumbers = [];

    // Проверяем, что мы находимся в Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready(); // Сообщаем Telegram, что приложение загружено
    }

    // Получаем состояние игры с бэкенда
    async function fetchGameState() {
        try {
            const response = await fetch("https://your-backend-url.com/game-state");
            const gameState = await response.json();

            // Обновляем интерфейс
            updateGameState(gameState);
        } catch (error) {
            console.error("Ошибка при получении состояния игры:", error);
        }
    }

    function updateGameState(gameState) {
        const allNumbers = document.querySelectorAll(".number");

        // Подсвечиваем выбранные номера
        allNumbers.forEach((numDiv) => {
            const num = parseInt(numDiv.textContent);
            if (gameState.selected_numbers.includes(num)) {
                numDiv.classList.add("selected");
            } else {
                numDiv.classList.remove("selected");
            }
        });

        // Показываем выигрышный номер
        if (gameState.winner_number) {
            highlightWinnerNumber(gameState.winner_number);
            winnerMessage.textContent = `Выигрышный номер: ${gameState.winner_number}`;
        }
    }

    function highlightWinnerNumber(winnerNumber) {
        const allNumbers = document.querySelectorAll(".number");
        allNumbers.forEach((numDiv) => {
            const num = parseInt(numDiv.textContent);
            if (num === winnerNumber) {
                numDiv.style.backgroundColor = "#ffcc00";
                numDiv.style.color = "#000";
            }
        });
    }

    // Создаем сетку номеров
    for (let i = 1; i <= 12; i++) {
        const numberDiv = document.createElement("div");
        numberDiv.classList.add("number");
        numberDiv.textContent = i;
        numberDiv.addEventListener("click", () => selectNumber(i));
        numbersGrid.appendChild(numberDiv);
    }

    function selectNumber(number) {
        if (selectedNumbers.length >= 3 || selectedNumbers.includes(number)) return;

        selectedNumbers.push(number);
        updateUI();

        // Отправляем выбор на бэкенд
        Telegram.WebApp.sendData(JSON.stringify({ action: "select_number", number }));

        // Проигрываем звук выбора
        selectSound.currentTime = 0;
        selectSound.play();
    }

    function updateUI() {
        const allNumbers = document.querySelectorAll(".number");
        allNumbers.forEach((numDiv) => {
            const num = parseInt(numDiv.textContent);
            if (selectedNumbers.includes(num)) {
                numDiv.classList.add("selected");
            } else {
                numDiv.classList.remove("selected");
            }
        });

        counterElement.textContent = selectedNumbers.length;

        if (selectedNumbers.length === 3) {
            startButton.disabled = false;
        }
    }

    startButton.addEventListener("click", () => {
        const wheel = document.getElementById("roulette-wheel");
        const randomRotation = Math.floor(Math.random() * 360) + 720; // Минимум 2 полных оборота

        wheel.style.transition = "transform 3s ease-out";
        wheel.style.transform = `rotateX(60deg) rotateZ(${randomRotation}deg)`;

        // Проигрываем звук вращения
        spinSound.currentTime = 0;
        spinSound.play();

        setTimeout(() => {
            wheel.style.transition = "none";
            wheel.style.transform = `rotateX(60deg) rotateZ(0deg)`;
        }, 3000);

        // Отправляем запрос на запуск рулетки
        Telegram.WebApp.sendData(JSON.stringify({ action: "start_roulette" }));
    });

    // Обработка данных от бэкенда
    window.Telegram.WebApp.onEvent("dataReceived", (data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.action === "announce_winner") {
            const winnerNumber = parsedData.winner_number;
            winnerMessage.textContent = `Выигрышный номер: ${winnerNumber}`;
            highlightWinnerNumber(winnerNumber);
        }
    });

    // Инициализация: получаем состояние игры
    fetchGameState();
});
