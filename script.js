class WorldClock {
    constructor() {
        this.is24HourFormat = true;
        this.theme = 'light';
        this.currentTab = 'time';
        this.weatherData = {};
        this.weatherApiKey = '215d9235c8b6f9a95c4f1260666de0c9';
        this.weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';

        // Данные городов
        this.cities = [
            {
                id: 'moscow',
                name: 'Москва',
                timezone: 'Europe/Moscow',
                coordinates: { lat: 55.7558, lon: 37.6173 }
            },
            {
                id: 'vladivostok',
                name: 'Владивосток',
                timezone: 'Asia/Vladivostok',
                coordinates: { lat: 43.1056, lon: 131.8735 }
            },
            {
                id: 'beijing',
                name: 'Пекин',
                timezone: 'Asia/Shanghai',
                coordinates: { lat: 31.2304, lon: 121.4737 }
            },
            {
                id: 'tokyo',
                name: 'Токио',
                timezone: 'Asia/Tokyo',
                coordinates: { lat: 35.6762, lon: 139.6503 }
            },
            {
                id: 'las-vegas',
                name: 'Лас-Вегас',
                timezone: 'America/Los_Angeles',
                coordinates: { lat: 34.0522, lon: -118.2437 }
            },
            {
                id: 'new-york',
                name: 'Нью-Йорк',
                timezone: 'America/New_York',
                coordinates: { lat: 40.7128, lon: -74.0060 }
            },
            {
                id: 'washington',
                name: 'Вашингтон',
                timezone: 'America/New_York', // Тот же пояс что и Нью-Йорк
                coordinates: { lat: 38.9072, lon: -77.0369 }
            },
            {
                id: 'london',
                name: 'Лондон',
                timezone: 'Europe/London',
                coordinates: { lat: 51.5074, lon: -0.1278 }
            }
        ];

        this.isWeatherLoading = false;
        this.init();
    }

    init() {
        this.cacheElements();
        this.createCards();
        this.bindEvents();
        this.startClock();
        this.updateDate();
        this.startWorldClocks();
        this.loadPreferences();
    }

    cacheElements() {
        // Стрелки
        this.hourHand = document.querySelector('.hour-hand');
        this.minuteHand = document.querySelector('.minute-hand');
        this.secondHand = document.querySelector('.second-hand');

        // Цифровое время
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.secondsElement = document.getElementById('seconds');
        this.dateElement = document.getElementById('date');
        this.sectionTitle = document.getElementById('section-title');

        // Кнопки
        this.themeToggle = document.getElementById('theme-toggle');
        this.formatToggle = document.getElementById('format-toggle');
        this.tabButtons = document.querySelectorAll('.tab-btn');

        // Контейнеры
        this.citiesContainer = document.getElementById('cities-container');
        this.citiesGrid = null;

        // Создаем прелоадер
        this.createPreloader();
    }

    createPreloader() {
        this.preloader = document.createElement('div');
        this.preloader.className = 'weather-preloader hidden';
        this.preloader.innerHTML = `
            <div class="preloader-spinner"></div>
            <div class="preloader-text">Загружаем данные о погоде...</div>
        `;
        this.citiesContainer.appendChild(this.preloader);
    }

    createCards() {
        // Создаем сетку для карточек
        this.citiesGrid = document.createElement('div');
        this.citiesGrid.className = 'cities-grid';

        // Создаем карточки для каждого города
        this.cities.forEach(city => {
            const card = this.createCityCard(city);
            this.citiesGrid.appendChild(card);
        });

        this.citiesContainer.appendChild(this.citiesGrid);

        // Сохраняем ссылки на все карточки
        this.cityCards = this.citiesGrid.querySelectorAll('.city-card');
    }

    createCityCard(city) {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.setAttribute('data-city', city.timezone);
        card.setAttribute('data-city-id', city.id);

        card.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="city-data time-data">
                <div class="city-time">00:00:00</div>
                <div class="city-date"></div>
            </div>
            <div class="city-data temperature-data hidden">
                <span class="weather-icon">🌈</span>
                <span class="temperature-value">--°C</span>
                <div class="weather-description">Загрузка...</div>
            </div>
        `;

        return card;
    }

    clearCards() {
        // Удаляем все существующие карточки и сетку
        const existingGrid = this.citiesContainer.querySelector('.cities-grid');
        if (existingGrid) {
            existingGrid.remove();
        }

        const existingError = this.citiesContainer.querySelector('.weather-error');
        if (existingError) {
            existingError.remove();
        }

        this.citiesGrid = null;
        this.cityCards = null;
    }

    getCityCard(cityId) {
        return this.citiesGrid.querySelector(`[data-city-id="${cityId}"]`);
    }

    getCityCardByTimezone(timezone) {
        if (!this.citiesGrid) return null;
        // Ищем все карточки с данным часовым поясом
        return Array.from(this.citiesGrid.querySelectorAll(`[data-city="${timezone}"]`));
    }

    showPreloader() {
        if (this.citiesGrid) {
            this.citiesGrid.classList.remove('loaded');
            this.citiesGrid.style.display = 'none';
        }
        this.preloader.classList.remove('hidden');

        // Скрываем все карточки
        if (this.cityCards) {
            this.cityCards.forEach(card => {
                card.classList.remove('visible');
            });
        }
    }

    hidePreloader() {
        this.preloader.classList.add('hidden');
        if (this.citiesGrid) {
            this.citiesGrid.style.display = 'grid';

            // Показываем сетку с анимацией
            setTimeout(() => {
                this.citiesGrid.classList.add('loaded');
            }, 50);

            // Показываем карточки с задержкой
            setTimeout(() => {
                if (this.cityCards) {
                    this.cityCards.forEach(card => {
                        card.classList.add('visible');
                    });
                }
            }, 300);
        }
    }

    showError(message = 'Не удалось загрузить данные о погоде') {
        this.preloader.classList.add('hidden');
        if (this.citiesGrid) {
            this.citiesGrid.style.display = 'none';
        }

        // Удаляем старую ошибку если есть
        const existingError = this.citiesContainer.querySelector('.weather-error');
        if (existingError) {
            existingError.remove();
        }

        const errorElement = document.createElement('div');
        errorElement.className = 'weather-error';
        errorElement.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">${message}</div>
            <button class="retry-btn" onclick="worldClock.retryWeatherLoad()">Повторить</button>
        `;
        this.citiesContainer.appendChild(errorElement);
    }

    hideError() {
        const errorElement = this.citiesContainer.querySelector('.weather-error');
        if (errorElement) {
            errorElement.remove();
        }
        if (this.citiesGrid) {
            this.citiesGrid.style.display = 'grid';
        }
    }

    retryWeatherLoad() {
        this.updateWeatherData();
    }

    bindEvents() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.formatToggle.addEventListener('click', () => this.toggleFormat());

        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Обновляем активную кнопку таба
        this.tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Обновляем заголовок секции
        if (tabName === 'time') {
            this.sectionTitle.textContent = 'Время в городах мира';
            this.showTimeData();
        } else {
            this.sectionTitle.textContent = 'Температура в городах мира';
            this.showWeatherData();
        }

        // Сохраняем выбор таба
        localStorage.setItem('currentTab', tabName);
    }

    showTimeData() {
        this.hideError();
        if (this.citiesGrid) {
            this.citiesGrid.style.display = 'grid';
        }
        this.preloader.classList.add('hidden');

        // Показываем данные времени
        if (this.cityCards) {
            this.cityCards.forEach(card => {
                const timeData = card.querySelector('.time-data');
                const tempData = card.querySelector('.temperature-data');

                timeData.classList.remove('hidden');
                tempData.classList.add('hidden');
            });
        }

        // Анимируем появление
        setTimeout(() => {
            if (this.citiesGrid) {
                this.citiesGrid.classList.add('loaded');
            }
            if (this.cityCards) {
                this.cityCards.forEach(card => {
                    card.classList.add('visible');
                });
            }
        }, 50);
    }

    showWeatherData() {
        // Сразу показываем прелоадер
        this.showPreloader();

        // Показываем данные температуры
        if (this.cityCards) {
            this.cityCards.forEach(card => {
                const timeData = card.querySelector('.time-data');
                const tempData = card.querySelector('.temperature-data');

                timeData.classList.add('hidden');
                tempData.classList.remove('hidden');
            });
        }

        // Загружаем данные погоды
        this.updateWeatherData();
    }

    startClock() {``
        // Запуск обновления каждую секунду
        setInterval(() => {
            this.updateTime();
        }, 1000);

        // Первоначальное обновление
        this.updateTime();
    }

    startWorldClocks() {
        // Запуск обновления мирового времени каждую секунду
        setInterval(() => {
            this.updateWorldClocks();
        }, 1000);

        // Первоначальное обновление
        this.updateWorldClocks();
    }

    async updateWeatherData() {
        if (this.currentTab !== 'temperature') return;

        if (this.isWeatherLoading) return;
        this.isWeatherLoading = true;

        this.showPreloader();

        try {
            const promises = this.cities.map(async (city) => {
                try {
                    const weather = await this.fetchWeatherData(city.coordinates.lat, city.coordinates.lon);
                    this.weatherData[city.timezone] = weather;
                    this.updateCityWeather(city.timezone, weather);
                } catch (error) {
                    console.error(`Ошибка получения погоды для ${city.name}:`, error);
                    this.updateCityWeather(city.timezone, this.getFallbackWeather());
                }
            });

            await Promise.allSettled(promises);

            // Проверяем, есть ли успешные загрузки
            const successfulLoads = Object.values(this.weatherData).filter(data => data.temp !== '--').length;

            if (successfulLoads > 0) {
                // Успешная загрузка, скрываем прелоадер и показываем данные
                setTimeout(() => {
                    this.hidePreloader();
                }, 500);
            } else {
                // Все запросы провалились
                this.showError('Не удалось загрузить данные о погоде. Проверьте подключение к интернету.');
            }

        } catch (error) {
            console.error('Общая ошибка при загрузке погоды:', error);
            this.showError('Произошла ошибка при загрузке данных.');
        } finally {
            this.isWeatherLoading = false;
        }
    }

    async fetchWeatherData(lat, lon) {
        // Если API ключ не установлен, используем демо-данные с задержкой
        if (!this.weatherApiKey || this.weatherApiKey === 'your_api_key_here') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.getDemoWeatherData();
        }

        const url = `${this.weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric&lang=ru`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            temp: Math.round(data.main.temp),
            icon: this.getWeatherIcon(data.weather[0].icon),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed
        };
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌦️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };

        return iconMap[iconCode] || '🌈';
    }

    getDemoWeatherData() {
        // Случайные демо-данные
        const descriptions = ['Солнечно', 'Облачно', 'Пасмурно', 'Небольшой дождь', 'Дождь', 'Снег', 'Туман'];
        const icons = ['☀️', '⛅', '☁️', '🌦️', '🌧️', '❄️', '🌫️'];
        const randomIndex = Math.floor(Math.random() * descriptions.length);

        return {
            temp: Math.floor(Math.random() * 35) - 10, // от -10 до +25
            icon: icons[randomIndex],
            description: descriptions[randomIndex],
            humidity: Math.floor(Math.random() * 50) + 50, // 50-100%
            pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
            windSpeed: Math.floor(Math.random() * 10) + 1 // 1-10 м/с
        };
    }

    getFallbackWeather() {
        return {
            temp: '--',
            icon: '🌈',
            description: 'Нет данных',
            humidity: '--',
            pressure: '--',
            windSpeed: '--'
        };
    }

    updateCityWeather(timezone, weather) {
        const cards = this.getCityCardByTimezone(timezone);
        if (!cards || cards.length === 0) return;

        // Обновляем все карточки с данным часовым поясом
        cards.forEach(card => {
            const tempElement = card.querySelector('.temperature-value');
            const iconElement = card.querySelector('.weather-icon');
            const descElement = card.querySelector('.weather-description');

            if (tempElement) tempElement.textContent = `${weather.temp}°C`;
            if (iconElement) iconElement.textContent = weather.icon;
            if (descElement) descElement.textContent = weather.description;

            // Добавляем дополнительную информацию при наведении
            card.title = `Влажность: ${weather.humidity}% | Давление: ${weather.pressure} hPa | Ветер: ${weather.windSpeed} м/с`;
        });
    }
    updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Обновление аналоговых часов
        this.updateAnalogClock(hours, minutes, seconds);

        // Обновление цифровых часов
        this.updateDigitalClock(hours, minutes, seconds);
    }

    updateAnalogClock(hours, minutes, seconds) {
        const secondsDegrees = ((seconds / 60) * 360) + 90;
        const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

        this.secondHand.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`;
        this.minuteHand.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`;
        this.hourHand.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`;
    }

    updateDigitalClock(hours, minutes, seconds) {
        let displayHours = hours;

        if (!this.is24HourFormat) {
            displayHours = hours % 12 || 12;
            const ampm = hours >= 12 ? ' PM' : ' AM';
            this.hoursElement.textContent = displayHours.toString().padStart(2, '0');
            this.secondsElement.textContent = seconds.toString().padStart(2, '0') + ampm;
        } else {
            this.hoursElement.textContent = displayHours.toString().padStart(2, '0');
            this.secondsElement.textContent = seconds.toString().padStart(2, '0');
        }

        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
    }

    updateWorldClocks() {
        if (this.currentTab !== 'time') return;

        if (this.cityCards) {
            this.cityCards.forEach(card => {
                const timezone = card.getAttribute('data-city');
                const cityId = card.getAttribute('data-city-id');
                this.updateCityTime(card, timezone, cityId);
            });
        }
    }

    updateCityTime(card, timezone, cityId) {
        try {
            const now = new Date();
            const timeString = this.formatTimeWithTimezone(now, timezone, cityId);
            const dateString = this.formatDateWithTimezone(now, timezone);

            const timeElement = card.querySelector('.city-time');
            const dateElement = card.querySelector('.city-date');

            if (timeElement) timeElement.textContent = timeString;
            if (dateElement) dateElement.textContent = dateString;

        } catch (error) {
            console.error(`Ошибка обновления времени для ${timezone} (${cityId}):`, error);
            this.updateCityTimeFallback(card);
        }
    }

    formatTimeWithTimezone(date, timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('ru-RU', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: !this.is24HourFormat
            });

            let timeString = formatter.format(date);

            if (!this.is24HourFormat) {
                const options = {
                    timeZone: timezone,
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                timeString = new Intl.DateTimeFormat('en-US', options).format(date);
            }

            return timeString;
        } catch (error) {
            console.error(`Ошибка форматирования времени для ${timezone}:`, error);
            return this.calculateTimeManually(date, timezone);
        }
    }

    formatDateWithTimezone(date, timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('ru-RU', {
                timeZone: timezone,
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            return formatter.format(date);
        } catch (error) {
            console.error(`Ошибка форматирования даты для ${timezone}:`, error);
            return date.toLocaleDateString('ru-RU');
        }
    }

    calculateTimeManually(date, timezone) {
        const timezoneOffsets = {
            'Europe/Moscow': 3,
            'Asia/Vladivostok': 10,
            'Asia/Shanghai': 8,
            'Asia/Tokyo': 9,
            'America/Los_Angeles': -8,
            'America/New_York': -5,
            'Europe/London': 0
        };

        const offset = timezoneOffsets[timezone] || 0;
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (3600000 * offset));

        const hours = localTime.getHours().toString().padStart(2, '0');
        const minutes = localTime.getMinutes().toString().padStart(2, '0');
        const seconds = localTime.getSeconds().toString().padStart(2, '0');

        if (!this.is24HourFormat) {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
            return `${displayHours}:${minutes}:${seconds} ${ampm}`;
        }

        return `${hours}:${minutes}:${seconds}`;
    }

    updateCityTimeFallback(card) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        const timeElement = card.querySelector('.city-time');
        const dateElement = card.querySelector('.city-date');

        if (!this.is24HourFormat) {
            const displayHours = (now.getHours() % 12 || 12).toString().padStart(2, '0');
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            timeElement.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
        } else {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        }

        dateElement.textContent = now.toLocaleDateString('ru-RU');
    }

    updateDate() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        this.dateElement.textContent = now.toLocaleDateString('ru-RU', options);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'light' ? '🌙 Сменить тему' : '☀️ Сменить тему';

        localStorage.setItem('theme', this.theme);
    }

    toggleFormat() {
        this.is24HourFormat = !this.is24HourFormat;
        this.formatToggle.textContent = this.is24HourFormat ? '24ч Формат' : '12ч Формат';

        localStorage.setItem('timeFormat', this.is24HourFormat ? '24' : '12');

        this.updateTime();
        if (this.currentTab === 'time') {
            this.updateWorldClocks();
        }
    }

    loadPreferences() {
        // Загрузка темы
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.theme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.theme);
            this.themeToggle.textContent = this.theme === 'light' ? '🌙 Сменить тему' : '☀️ Сменить тему';
        }

        // Загрузка формата времени
        const savedFormat = localStorage.getItem('timeFormat');
        if (savedFormat) {
            this.is24HourFormat = savedFormat === '24';
            this.formatToggle.textContent = this.is24HourFormat ? '24ч Формат' : '12ч Формат';
        }

        // Загрузка активного таба
        const savedTab = localStorage.getItem('currentTab');
        if (savedTab && savedTab === 'underfined') {
            this.switchTab(savedTab);
        } else {
            // При первой загрузке сразу показываем время с анимацией
            setTimeout(() => {
                if (this.citiesGrid) {
                    this.citiesGrid.classList.add('loaded');
                }
                if (this.cityCards) {
                    this.cityCards.forEach(card => {
                        card.classList.add('visible');
                    });
                }
            }, 100);
        }
    }
}

// Глобальная переменная для доступа из HTML
let worldClock;

// Инициализация часов когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    worldClock = new WorldClock();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            worldClock.updateTime();
            if (worldClock.currentTab === 'time') {
                worldClock.updateWorldClocks();
            }
        }
    });
});
