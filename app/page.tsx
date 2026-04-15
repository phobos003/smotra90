"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

export default function Home(){

const images = [
"/foto/icecream.jpg",
"/foto/2.jpeg",
"/foto/3.jpeg",
"/foto/4.jpeg",
"/foto/5.jpeg",
"/foto/6.jpeg"
]

const [selected,setSelected] = useState<number | null>(null)
const [menuOpen,setMenuOpen] = useState(false)
const [darkMode,setDarkMode] = useState(false)
const [openFaq,setOpenFaq] = useState<number | null>(null)

const faqData = [
{q:"Можно ли прийти с детьми?", a:"Да, мы рады гостям любого возраста. Дети до 5 лет проходят бесплатно. Для безопасности детей на площадке установлены ограждения."},
{q:"Что делать если плохая погода?", a:"Смотровая площадка работает в любую погоду. Площадка застеклена, поэтому дождь и ветер не помешают вашему визиту. В туманные дни открывается особенная атмосфера над облаками."},
{q:"Есть ли парковка?", a:"Да, в Москва‑Сити есть подземная парковка. Стоимость — от 200 ₽/час. Также удобно добраться на метро — станции «Выставочная» и «Деловой центр»."},
{q:"Сколько длится посещение?", a:"Время посещения не ограничено. В среднем гости проводят на площадке 1–2 часа. Экскурсия с гидом длится около 30 минут."},
{q:"Нужно ли бронировать заранее?", a:"Рекомендуем бронировать билеты онлайн, особенно на вечерние сеансы и выходные. Так вы гарантируете себе место и избежите очереди."},
{q:"Можно ли проводить мероприятия?", a:"Да, мы организуем дни рождения, корпоративы и романтические вечера на высоте 90 этажа. Свяжитесь с нами для обсуждения деталей."},
]

const galleryRef = useRef<HTMLDivElement>(null)
const countersRef = useRef<HTMLDivElement>(null)
const countersStarted = useRef(false)

useEffect(() => {

if ("scrollRestoration" in history) {
history.scrollRestoration = "manual"
}

window.scrollTo(0,0)

setTimeout(()=>{
window.scrollTo(0,0)
},50)

if(window.location.hash){
history.replaceState(null,"",window.location.pathname)
}

const handleScroll = () => {

const nav = document.querySelector(".nav")
const scrollBtn = document.querySelector(".scrollTop")

if(nav){
if(window.scrollY > 50){
nav.classList.add("scrolled")
}else{
nav.classList.remove("scrolled")
}
}

if(scrollBtn){
if(window.scrollY > 600){
scrollBtn.classList.add("show")
}else{
scrollBtn.classList.remove("show")
}
}

const progressBar = document.querySelector(".scrollProgress") as HTMLElement
if(progressBar){
const scrolled = window.scrollY
const total = document.documentElement.scrollHeight - window.innerHeight
const pct = total > 0 ? (scrolled / total) * 100 : 0
progressBar.style.width = pct + "%"
}

}

window.addEventListener("scroll",handleScroll)

const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("visible")
}
})
},{
threshold:0.2
})

document.querySelectorAll(".fadeUp").forEach(el=>{
observer.observe(el)
})

return () => window.removeEventListener("scroll",handleScroll)

},[])

useEffect(()=>{

if (window.innerWidth <= 768) return

const el = galleryRef.current
if(!el) return

const interval = setInterval(()=>{

if(el.scrollWidth - el.scrollLeft - el.clientWidth < 50){
el.scrollTo({ left:0, behavior:"smooth" })
}else{
el.scrollBy({ left:320, behavior:"smooth" })
}

},3000)

return ()=>clearInterval(interval)

},[])

useEffect(()=>{
const el = countersRef.current
if(!el) return

const animateCounter = (span:HTMLElement, target:number, suffix:string) => {
const duration = 1800
const start = performance.now()
const step = (now:number) => {
const progress = Math.min((now - start) / duration, 1)
const eased = 1 - Math.pow(1 - progress, 3)
const current = Math.round(eased * target)
span.textContent = current.toLocaleString("ru-RU") + suffix
if(progress < 1) requestAnimationFrame(step)
}
requestAnimationFrame(step)
}

const observer = new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting && !countersStarted.current){
countersStarted.current = true
el.querySelectorAll<HTMLElement>("[data-target]").forEach(span=>{
const target = parseInt(span.dataset.target || "0")
const suffix = span.dataset.suffix || ""
animateCounter(span, target, suffix)
})
}
})
},{threshold:0.3})

observer.observe(el)
return ()=>observer.disconnect()
},[])

useEffect(() => {
const saved = localStorage.getItem('theme')
if (saved === 'dark') {
setDarkMode(true)
document.body.classList.add('dark')
}
}, [])

const toggleDark = () => {
const next = !darkMode
setDarkMode(next)
document.body.classList.toggle('dark', next)
localStorage.setItem('theme', next ? 'dark' : 'light')
}

const scrollTo = (id:string) => {
setMenuOpen(false)
const el = document.getElementById(id)
if(el) el.scrollIntoView({behavior:"smooth",block:"start"})
}


return(

<main>

<div className="scrollProgress" />

<section className="ticker">

<div className="tickerTrack">

<span>Панорамный вид на Москву</span>
<span>90 этаж Москва‑Сити</span>
<span>Бесплатное мороженое</span>
<span>Фотосессии</span>
<span>Экскурсия с гидом</span>
<span>270° обзор столицы</span>

<span>Панорамный вид на Москву</span>
<span>90 этаж Москва‑Сити</span>
<span>Бесплатное мороженое</span>
<span>Фотосессии</span>
<span>Экскурсия с гидом</span>
<span>270° обзор столицы</span>
<span>333 метра над землей</span>

</div>

</section>

<nav className="nav">

<div className="logo">
<Image
src="/foto/logo_n.png"
alt="Высота 90"
width={220}
height={75}
priority
style={{objectFit:"contain"}}
/>
</div>

<div className={`menu ${menuOpen ? "open" : ""}`}>
<a onClick={()=>scrollTo("hero")}>Главная</a>
<a onClick={()=>scrollTo("tickets")}>Билеты</a>
<a onClick={()=>scrollTo("about")}>О площадке</a>
<a onClick={()=>scrollTo("contacts")}>Контакты</a>
<a href="/rules">Правила</a>
<a href="/location">Как добраться</a>
</div>

<div className="navRight">

<button className="themeToggle" onClick={toggleDark} aria-label="Переключить тему" />

<a onClick={()=>scrollTo("tickets")} className="heroButton">
Купить билет
</a>

<div
className="burger"
onClick={()=>setMenuOpen(!menuOpen)}
>
<span></span>
<span></span>
<span></span>
</div>

</div>

</nav>

<section id="hero" className="hero">

<video autoPlay muted loop playsInline className="heroVideo">
<source src="/video/moscow.mp4" type="video/mp4"/>
</video>

<div className="heroContent">

<h1 className="heroAnim heroAnim1">Высота 90</h1>

<p className="heroAnim heroAnim2">
Панорамная смотровая площадка в&nbsp;Москва‑Сити.
</p>

<p className="heroAnim heroAnim3">
Откройте захватывающий вид на столицу с&nbsp;высоты 90&nbsp;этажа.
</p>

<div className="heroBottom heroAnim heroAnim4">
<a onClick={()=>scrollTo("tickets")} className="buyButton">
Купить билет
</a>
<div className="heroBadge">
<span>Лучшие закаты в&nbsp;сердце Москвы</span>
</div>
</div>

</div>

<div className="heroCard heroAnim heroAnim4">
<div className="heroCardText">
<h3>Москва как на ладони</h3>
<p>Небоскрёбы делового центра, изгиб Москвы‑реки и самые красивые закаты города.</p>
</div>
<div className="heroCardImage">
<Image
src="/foto/panorama.jpeg"
alt="Панорама"
width={120}
height={80}
style={{objectFit:"cover",width:"100%",height:"100%",borderRadius:"12px"}}
/>
</div>
</div>

</section>

<section className="premium">

<h2 className="premiumHeading fadeUp">Что входит в билет?</h2>

<div className="premiumRow">

<div className="premiumImage">
<Image
src="/foto/icecream.jpg"
alt="Мороженое"
width={500}
height={750}
style={{
objectFit:"cover",
objectPosition:"center 60%",
width:"100%",
height:"100%"
}}
/>
</div>

<div className="premiumContent">
<h2>Бесплатное мороженое</h2>
<div className="line"></div>
<p>
Каждому гостю — бесплатное мороженое во время посещения.
</p>
<div className="circle">1</div>
</div>

</div>

<div className="premiumRow reverse">

<div className="premiumImage">
<Image
src="/foto/fhotograf.jpeg"
alt="Фотосессия"
width={500}
height={300}
style={{
objectFit:"cover",
width:"100%",
height:"100%"
}}
/>
</div>

<div className="premiumContent">
<h2>Фотосъёмка с видом на Москву</h2>
<div className="line"></div>
<p>
Профессиональный фотограф создаст для вас общий снимок на фоне города.
Фотография формата 9×9 распечатывается и передаётся на компанию (от 2 человек).
</p>
<p>Финальный кадр отбирается фотографом.</p>
<div className="circle">2</div>
</div>

</div>

<div className="premiumRow">

<div className="premiumImage">
<Image
src="/foto/экскурсии.jpeg"
alt="Экскурсия"
width={500}
height={300}
style={{
objectFit:"cover",
width:"100%",
height:"100%"
}}
/>
</div>

<div className="premiumContent">
<h2>Экскурсия с гидом</h2>
<div className="line"></div>
<p>
История Москва-Сити, особенности башен и их строительства, архитектура и интересные факты о столице — в сопровождении профессионального гида.
</p>
<p>(экскурсии проводятся в начале каждого часа)</p>
<div className="circle">3</div>
</div>

</div>

</section>

<section className="counters" ref={countersRef}>
<div className="counterItem">
<span className="counterValue" data-target="10000" data-suffix="+">0</span>
<span className="counterLabel">Гостей посетили</span>
</div>
<div className="counterItem">
<span className="counterValue" data-target="90" data-suffix=" этаж">0</span>
<span className="counterLabel">Высота площадки</span>
</div>
<div className="counterItem">
<span className="counterValue" data-target="270" data-suffix="°">0</span>
<span className="counterLabel">Обзор столицы</span>
</div>
<div className="counterItem">
<span className="counterValue" data-target="365" data-suffix=" дней">0</span>
<span className="counterLabel">Работаем в году</span>
</div>
</section>

<section className="panorama fadeUp">

<div className="panoramaContent">

<h2>Москва с высоты</h2>

<p>
Панорамный вид на столицу с высоты 90 этажа.
Небоскрёбы Москва‑Сити, изгиб Москвы‑реки
и бескрайний городской горизонт.
</p>

</div>

</section>

<section className="gallery fadeUp">

<h2>Галерея</h2>

<div className="galleryGrid" ref={galleryRef}>

{images.map((src,index)=>(
<div
className="galleryItem"
key={index}
onClick={()=>setSelected(index)}
>

<Image
src={src}
alt="Москва-Сити"
fill
sizes="(max-width:768px) 100vw, 33vw"
style={{objectFit:"cover"}}
/>

</div>
))}

</div>

</section>

<section id="tickets" className="tickets fadeUp">

<h2>Билеты</h2>

<div className="ticketGrid">

<div className="ticketCard">
<h3>Стандарт</h3>
<p>Доступ на смотровую площадку и свободное время для прогулки.</p>
<span className="price">900 ₽</span>
<button>Купить</button>
</div>

<div className="ticketCard featured">
<span className="badge">Популярный</span>
<h3>Закат</h3>
<p>Посещение площадки в самое красивое время дня.</p>
<span className="price">1200 ₽</span>
<button>Купить</button>
</div>

<div className="ticketCard vip">
<h3>VIP</h3>
<p>Отдельная зона отдыха и лучшие виды на город.</p>
<span className="price">2500 ₽</span>
<button>Купить</button>
</div>

</div>

</section>

<section id="about" className="about fadeUp">

<h2>О площадке</h2>

<p>
Высота 90 — современная панорамная смотровая площадка,
расположенная в сердце Москва‑Сити.
</p>

<p>
Гостей ждут панорамные виды на столицу,
бесплатное мороженое, фотосессии,
экскурсии с гидом и развлекательная программа.
</p>

<section className="faq fadeUp">

<h2>Частые вопросы</h2>

<div className="faqList">
{faqData.map((item,i)=>(
<div className={`faqItem ${openFaq === i ? "open" : ""}`} key={i}>
<button className="faqQuestion" onClick={()=>setOpenFaq(openFaq === i ? null : i)}>
<span>{item.q}</span>
<span className="faqIcon">{openFaq === i ? "−" : "+"}</span>
</button>
<div className="faqAnswer">
<p>{item.a}</p>
</div>
</div>
))}
</div>

</section>

<section className="contactsSection">

<section id="contacts" className="contacts fadeUp">

<h2>Контакты</h2>

<p>Москва‑Сити</p>
<p>Пресненская набережная</p>

<p>Ежедневно с 11:00 до 23:00</p>

<p>info@visota90.ru</p>

<div className="contactButtons">

<a
href="https://yandex.ru/maps/?ll=37.537434,55.749633&z=17&pt=37.537434,55.749633,pm2rdm"
target="_blank"
className="mapButton"
>
Открыть в Яндекс.Картах
</a>

<a
href="https://3.redirect.appmetrica.yandex.com/route?end-lat=55.749633&end-lon=37.537434"
target="_blank"
className="taxiButton"
>
Вызвать Яндекс Такси
</a>

</div>

<div className="map">

<iframe
src="https://yandex.com/map-widget/v1/?ll=37.537434%2C55.749633&z=16.89&pt=37.537434,55.749633,pm2rdm"
width="100%"
height="400"
style={{border:0}}
loading="lazy"
/>

</div>

</section>

</section>

</section>

<footer className="footer">

<div className="footerContent">

<div className="footerLogo">

<Image
src="/foto/logo_black.png"
alt="Высота 90"
width={180}
height={70}
style={{objectFit:"contain"}}
/>

<div className="footerTitle">
Высота 90
</div>

</div>

<div className="footerLinks">
<a href="#hero">Главная</a>
<a href="#tickets">Билеты</a>
<a href="#about">О площадке</a>
<a href="#contacts">Контакты</a>
<a href="/rules">Правила посещения</a>
<a href="/location">Как добраться</a>
</div>

<div className="footerInfo">
<p>Москва‑Сити</p>
<p>11:00 – 23:00</p>
<p>info@visota90.ru</p>
</div>

</div>

<div className="footerBottom">
© {new Date().getFullYear()} Высота 90
</div>

</footer>

<button
className="scrollTop"
onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
>
↑
</button>

<a
href="https://t.me/bezslova"
target="_blank"
className="telegramButton"
>
<img src="/foto/telegaa.svg" alt="Telegram" />
</a>

{selected !== null && (
<div className="lightbox" onClick={()=>setSelected(null)}>

<button
className="lightboxArrow left"
onClick={(e)=>{
e.stopPropagation()
setSelected((selected - 1 + images.length) % images.length)
}}
>
‹
</button>

<Image
src={images[selected]}
alt="Москва-Сити"
width={1400}
height={900}
className="lightboxImage"
/>

<button
className="lightboxArrow right"
onClick={(e)=>{
e.stopPropagation()
setSelected((selected + 1) % images.length)
}}
>
›
</button>

</div>
)}

</main>

)

}