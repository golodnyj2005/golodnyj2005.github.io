document.addEventListener("DOMContentLoaded", () => {
    const numbersGrid = document.getElementById("numbers-grid");
    const startButton = document.getElementById("start-roulette");

    let selectedNumbers = [];

    // Создаем сетку номеров
    for (let i = 1; i <= 12; i++) {
        const numberDiv = document.createElement("div");
        numberDiv.classList.add("number");
        numberDiv.textContent = i;
        numberDiv.addEventListener("click", () => selectNumber(i));
        numbersGrid.appendChild(numberDiv);
    }

    function selectNumber(number) {
        if (selectedNumbers.includes(number)) return;

        selectedNumbers.push(number);
        updateUI();

        // Отправляем выбор на бэкенд через Telegram Web App API
        Telegram.WebApp.sendData(JSON.stringify({ action: "select_number", number }));
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

        if (selectedNumbers.length === 12) {
            startButton.disabled = false;
        }
    }

    startButton.addEventListener("click", () => {
        const wheel = document.getElementById("roulette-wheel");
        const randomRotation = Math.floor(Math.random() * 360) + 720; // Минимум 2 полных оборота

        wheel.style.transition = "transform 3s ease-out";
        wheel.style.transform = `rotateX(60deg) rotateZ(${randomRotation}deg)`;

        setTimeout(() => {
            wheel.style.transition = "none";
            wheel.style.transform = `rotateX(60deg) rotateZ(0deg)`;
        }, 3000);

        // Отправляем запрос на запуск рулетки
        Telegram.WebApp.sendData(JSON.stringify({ action: "start_roulette" }));
    });
});
