"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Location(){

const [darkMode, setDarkMode] = useState(false)

useEffect(()=>{
const saved = localStorage.getItem("theme")
if(saved === "dark"){
setDarkMode(true)
document.body.classList.add("dark")
}
},[])

const toggleDark = () => {
const next = !darkMode
setDarkMode(next)
document.body.classList.toggle("dark", next)
localStorage.setItem("theme", next ? "dark" : "light")
}

return(
<main className="rulesPage">

<nav className="rulesNav">
<Link href="/" className="rulesBack">← На главную</Link>
<button className="themeToggle" onClick={toggleDark} aria-label="Переключить тему" />
</nav>

<div className="rulesContent">

<h1>Как добраться</h1>
<p className="rulesSubtitle">Смотровая площадка «Высота 90» — Москва-Сити, Пресненская набережная</p>

<div className="locationMap">
<iframe
src="https://yandex.com/map-widget/v1/?ll=37.537434%2C55.749633&z=16.89&pt=37.537434,55.749633,pm2rdm"
width="100%"
height="350"
style={{border:0}}
loading="lazy"
/>
</div>

<div className="rulesList">

<div className="rulesItem">
<h3>На метро</h3>
<p>Ближайшие станции метро:</p>
<ul>
<li><strong>«Выставочная»</strong> (Филёвская линия) — 5 минут пешком. Выход в сторону Москва-Сити, далее по указателям к башням.</li>
<li><strong>«Деловой центр»</strong> (Большая кольцевая линия) — 3 минуты пешком. Выход непосредственно в комплекс Москва-Сити.</li>
<li><strong>«Международная»</strong> (Филёвская линия) — 7 минут пешком.</li>
</ul>
</div>

<div className="rulesItem">
<h3>На автомобиле</h3>
<p>Подземная парковка Москва-Сити работает круглосуточно.</p>
<ul>
<li>Въезд со стороны Пресненской набережной и 1-го Красногвардейского проезда</li>
<li>Стоимость парковки — от 200 ₽/час</li>
<li>Навигатор: введите «Москва-Сити, Башня Федерация»</li>
</ul>
</div>

<div className="rulesItem">
<h3>На такси</h3>
<p>Удобнее всего подъехать к главному входу Москва-Сити со стороны Пресненской набережной. Укажите точку назначения:</p>
<ul>
<li>Пресненская набережная, д. 12</li>
<li>Среднее время в пути от центра — 15–25 минут</li>
</ul>
<div className="locationButtons">
<a
href="https://3.redirect.appmetrica.yandex.com/route?end-lat=55.749633&end-lon=37.537434"
target="_blank"
className="taxiButton"
>
Вызвать Яндекс Такси
</a>
</div>
</div>

<div className="rulesItem">
<h3>На автобусе</h3>
<ul>
<li>Остановка <strong>«Выставочный центр»</strong> — автобусы М2, 243, Т39</li>
<li>Остановка <strong>«Деловой центр»</strong> — автобусы 243, М1</li>
</ul>
</div>

<div className="rulesItem">
<h3>На электричке / МЦК</h3>
<ul>
<li>Станция МЦК <strong>«Деловой центр»</strong> — прямой выход в комплекс Москва-Сити</li>
<li>Пересадка с метро на МЦК бесплатна в течение 90 минут</li>
</ul>
</div>

</div>

<div className="locationCta">
<a
href="https://yandex.ru/maps/?ll=37.537434,55.749633&z=17&pt=37.537434,55.749633,pm2rdm"
target="_blank"
className="mapButton"
>
Открыть в Яндекс.Картах
</a>
</div>

</div>

</main>
)
}
