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
<h3>От метро «Деловой центр» (Линия 8А)</h3>
<p>Ближайшая станция метро — «Деловой центр».</p>
<p>Выйдите из вагона и, следуя указателям, направляйтесь к выходу №1 в ТРЦ «АФИМОЛЛ Сити».</p>
<p><strong>Внутри ТРЦ:</strong></p>
<ul>
<li>Ориентируйтесь на магазин «Yamaguchi» и поверните налево</li>
<li>Слева от вас будет магазин «Modi»</li>
</ul>
<p><strong>Далее:</strong></p>
<ul>
<li>Выйдите из ТРЦ</li>
<li>Перейдите дорогу и поверните направо</li>
<li>Двигайтесь прямо: по левую руку будет магазин «Азбука Вкуса»</li>
<li>Пройдите мимо него</li>
<li>Двигайтесь вдоль здания до конца</li>
<li>Поверните налево</li>
<li>Идите прямо и войдите в комплекс башни «Федерация» через восточный вход</li>
</ul>
<p>Далее пройдите к ресепшену MUME — он расположен справа, в конце холла.</p>
<p><strong>Наш представитель встретит вас и поможет подняться на 90 этаж.</strong></p>
</div>

<div className="rulesItem">
<h3>От станции МЦК «Москва-Сити»</h3>
<p>Выйдите из станции через выход №5. Перейдите дорогу в сторону небоскрёбов Москва-Сити.</p>
<p><strong>Далее:</strong></p>
<ul>
<li>Держитесь левее и двигайтесь прямо</li>
<li>Пройдите между двумя башнями, оставляя слева башню «ВТБ»</li>
<li>Ориентируйтесь на вывеску «NOVOTEL»</li>
</ul>
<p><strong>Подойдя к зданию:</strong></p>
<ul>
<li>Перейдите дорогу</li>
<li>Поверните налево</li>
<li>Двигайтесь прямо вдоль здания ТРЦ «АФИМОЛЛ Сити»</li>
</ul>
<p>Продолжайте движение, пока слева не увидите магазин «Азбука Вкуса».</p>
<ul>
<li>Пройдите мимо него (он будет по левую руку)</li>
<li>Двигайтесь вдоль здания до конца</li>
<li>Поверните налево</li>
<li>Идите прямо и войдите в комплекс башни «Федерация» через восточный вход</li>
</ul>
<p>Далее пройдите к ресепшену MUME — он расположен справа, в конце холла.</p>
<p><strong>Наш представитель встретит вас и поможет подняться на 90 этаж.</strong></p>
</div>

<div className="rulesItem">
<h3>На автомобиле</h3>
<p>У смотровой площадки «Высота 90» нет собственного паркинга на территории Москва-Сити.</p>
<p>Рекомендуем воспользоваться подземной парковкой ТРЦ «АФИМОЛЛ Сити» (Пресненская набережная, 2). Также доступна наземная парковка у башен Москва-Сити.</p>
<p>Справочная парковки: <a href="tel:+74951519494" style={{color:"#4FB6E8",fontWeight:600}}>+7 495 151-94-94</a></p>
<p><strong>Если вы припарковались в ТРЦ «АФИМОЛЛ Сити»:</strong></p>
<p>Поднимитесь на 2 этаж и следуйте к выходу №8.</p>
<p><strong>После выхода:</strong></p>
<ul>
<li>Поверните направо (слева от вас будет «Азбука Вкуса»)</li>
<li>Пройдите вдоль здания до конца</li>
<li>Поверните налево</li>
<li>Двигайтесь прямо и войдите в комплекс башни «Федерация» через восточный вход</li>
</ul>
<p>Далее пройдите к ресепшену MUME — он находится справа, в конце холла.</p>
<p><strong>Наш представитель встретит вас и поможет подняться на 90 этаж.</strong></p>
</div>

<div className="rulesItem">
<h3>На такси</h3>
<p>Укажите в навигаторе: <strong>Башня Федерация, восточный вход</strong>. Пресненская набережная, д. 12.</p>
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
