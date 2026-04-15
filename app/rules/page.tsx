"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Rules(){

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

<h1>Правила посещения</h1>

<div className="rulesList">

<div className="rulesItem">
<h3>Возрастные ограничения</h3>
<p>Дети до 5 лет проходят бесплатно в сопровождении взрослого. Дети от 5 до 12 лет — по детскому билету. Лица младше 14 лет допускаются только в сопровождении взрослых.</p>
</div>

<div className="rulesItem">
<h3>Безопасность</h3>
<p>На территории площадки необходимо соблюдать правила безопасности. Запрещается перегибаться через ограждения, сидеть на подоконниках и парапетах. Следуйте указаниям сотрудников площадки.</p>
</div>

<div className="rulesItem">
<h3>Запрещённые предметы</h3>
<p>На площадку запрещено проносить: алкогольные напитки, стеклянную тару, острые и режущие предметы, лазерные указки, воздушные шары. Крупногабаритные сумки и рюкзаки необходимо оставить в камере хранения.</p>
</div>

<div className="rulesItem">
<h3>Фото и видеосъёмка</h3>
<p>Любительская фото- и видеосъёмка разрешена без ограничений. Профессиональная съёмка (с использованием штативов, студийного света и дронов) возможна только по предварительному согласованию с администрацией.</p>
</div>

<div className="rulesItem">
<h3>Время посещения</h3>
<p>Площадка работает ежедневно с 11:00 до 23:00. Последний вход — за 30 минут до закрытия. Время нахождения на площадке не ограничено в рамках рабочих часов.</p>
</div>

<div className="rulesItem">
<h3>Возврат билетов</h3>
<p>Возврат билетов возможен не позднее чем за 24 часа до времени визита. Для возврата свяжитесь с нами по email info@visota90.ru или через Telegram. Возврат осуществляется в течение 5 рабочих дней.</p>
</div>

</div>

</div>

</main>
)
}
