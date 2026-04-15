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
<p className="rulesSubtitle">Башня Федерация, Пресненская набережная, 12</p>

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
<h3>От метро</h3>
<p><strong>Ближайшая станция — «Деловой центр» (Линия 8А)</strong></p>
<ul>
<li>Выйдите из вагона и, следуя указателям, двигайтесь к выходу №1 в ТРЦ «АФИМОЛЛ Сити». Вы увидите магазин «Yamaguchi», поверните налево от него. Слева от вас будет находиться магазин «Modi».</li>
<li>Выйдите из ТРЦ и перейдите дорогу. Вы увидите комплекс «Башня Федерация» и надпись «Башня Федерация. Южный вход».</li>
<li>Зайдите в комплекс и, следуя указателям, двигайтесь к эскалаторам в центре зала. Спуститесь два раза вниз на эскалаторе на -2 (минус второй) этаж.</li>
<li>Далее пройдите к ресепшену для подъёма на 89 этаж.</li>
</ul>
</div>

<div className="rulesItem">
<h3>От станции МЦК «Москва-Сити»</h3>
<ul>
<li>Выйдите со станции через выход №5. Перейдите дорогу к небоскрёбам Москва-Сити.</li>
<li>Держитесь левее, продолжайте движение прямо и пройдите между двух башен, оставляя по левую руку башню «ВТБ».</li>
<li>Продолжайте движение, ориентируясь на надпись «NOVOTEL». Подойдя вплотную, перейдите дорогу, поверните налево и двигайтесь прямо, вдоль невысокого здания (ТРЦ «АФИМОЛЛ Сити»).</li>
<li>Продолжайте движение, пока не увидите слева магазин «Азбука Вкуса».</li>
<li>Поворачивайте налево, поднимайтесь на крыльцо комплекса Башни «Федерация». Зайдите через южную входную группу.</li>
<li>Спуститесь по эскалаторам в центре зала на -2 (минус второй) этаж. Далее пройдите к ресепшену для подъёма на 89 этаж.</li>
</ul>
</div>

<div className="rulesItem">
<h3>На автомобиле</h3>
<p><strong>Площадка не имеет выделенного паркинга на территории Москва-Сити</strong></p>
<ul>
<li>Рекомендуем парковаться на подземной парковке в ТРЦ «АФИМОЛЛ Сити», по адресу: Пресненская набережная, 2. Также для автомобилей доступна наземная парковка у башен.</li>
<li>Если вы воспользовались парковкой ТРЦ «АФИМОЛЛ Сити», далее вам следует подняться на 2 этаж и следовать к выходу №8 из ТРЦ. Зайдите в комплекс Башни «Федерация» через южную входную группу, оставляя справа магазин «Азбука Вкуса».</li>
<li>Спуститесь по эскалаторам в центре зала на -2 (минус второй) этаж. Далее пройдите к ресепшену для подъёма на 89 этаж.</li>
</ul>
</div>

<div className="rulesItem">
<h3>На такси</h3>
<p>Укажите в навигаторе: <strong>Башня Федерация, южный вход</strong>. Пресненская набережная, д. 12.</p>
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

</div>

<div className="rulesItem" style={{textAlign:"center",background:"rgba(79,182,232,0.06)",border:"1px solid rgba(79,182,232,0.15)"}}>
<p>Если у вас возникнут вопросы, позвоните на горячую линию службы поддержки по номеру <a href="tel:+74951519494" style={{color:"#4FB6E8",fontWeight:600}}>+7 495 151-94-94</a></p>
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
