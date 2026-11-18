'use strict';
(() => {
    const $ = (s, r = document) => r.querySelector(s),
        $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rnd = (a, b) => a + Math.random() * (b - a);

    // Загрузка
    addEventListener('load', () => setTimeout(() => $('#loader').classList.add('off'), 900));

    // Прогресс, кнопка «наверх», параллакс (один обработчик)
    const bar = $('#progress'),
        up = $('#toTop'),
        par = $$('[data-parallax]');
    let tick = false;
    addEventListener('scroll', () => {
        if (tick) return;
        tick = true;
        requestAnimationFrame(() => {
            const y = scrollY,
                max = document.documentElement.scrollHeight - innerHeight;
            bar.style.width = (y / max * 100) + '%';
            up.classList.toggle('show', y > 600);
            if (!calm) par.forEach(el => el.style.transform = `translateY(${y * el.dataset.parallax}px)`);
            tick = false;
        });
    }, { passive: true });
    up.onclick = () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });

    // Появление элементов
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target,
            lines = $$('.line', el);
        el.classList.add('in');
        lines.forEach((l, i) => setTimeout(() => l.classList.add('in'), calm ? 0 : 500 + i * 700));
        io.unobserve(el);
    }), { threshold: .2 });
    $$('.reveal').forEach(el => io.observe(el));

    // Меню
    const burger = $('#burger'),
        menu = $('#menu');
    const toggleMenu = open => { menu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); };
    burger.onclick = () => toggleMenu(!menu.classList.contains('open'));
    menu.onclick = e => { if (e.target.tagName === 'A') toggleMenu(false); };

    // Курсор
    const cur = $('#cursor');
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
        let tx = 0,
            ty = 0,
            x = 0,
            y = 0;
        addEventListener('mousemove', e => { tx = e.clientX;
            ty = e.clientY; }, { passive: true });
        (function loop() { x += (tx - x) * .2;
            y += (ty - y) * .2;
            cur.style.transform = `translate(${x}px,${y}px)`;
            requestAnimationFrame(loop); })();
        document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,label,.ph')));
    }

    // Частицы: сердечки и искры
    function particles(cv) {
        const ctx = cv.getContext('2d'),
            hearts = cv.dataset.fx === 'hearts';
        let w, h, ps = [],
            on = false;
        const size = () => { w = cv.width = cv.offsetWidth;
            h = cv.height = cv.offsetHeight; };
        const mk = () => ({ x: rnd(0, w), y: hearts ? h + 20 : rnd(0, h), s: rnd(6, hearts ? 18 : 4), v: rnd(.3, 1.1), a: rnd(.2, .8), p: rnd(0, 6) });
        size();
        addEventListener('resize', size);
        const n = innerWidth < 700 ? 18 : 36;
        for (let i = 0; i < n; i++) { const p = mk();
            p.y = rnd(0, h);
            ps.push(p); }
        const heart = (x, y, s) => { ctx.beginPath();
            ctx.moveTo(x, y + s / 4);
            ctx.bezierCurveTo(x, y - s / 2, x - s, y - s / 2, x - s, y + s / 4);
            ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.2, x, y + s * 1.6);
            ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s, x + s, y + s / 4);
            ctx.bezierCurveTo(x + s, y - s / 2, x, y - s / 2, x, y + s / 4);
            ctx.fill(); };
        (function draw(t = 0) {
            if (on) {
                ctx.clearRect(0, 0, w, h);
                ps.forEach(p => {
                    p.p += .02;
                    p.y += hearts ? -p.v : -p.v * .3;
                    p.x += Math.sin(p.p) * .4;
                    if (p.y < -30) Object.assign(p, mk());
                    ctx.globalAlpha = p.a * (hearts ? 1 : .5 + .5 * Math.sin(t / 400 + p.p));
                    ctx.fillStyle = hearts ? '#f4c6d0' : '#fff2f5';
                    hearts ? heart(p.x, p.y, p.s / 2) : (ctx.beginPath(), ctx.arc(p.x, p.y, p.s / 2, 0, 7), ctx.fill());
                });
            }
            if (!calm) requestAnimationFrame(draw);
        })();
        new IntersectionObserver(([e]) => on = e.isIntersecting).observe(cv);
        if (calm) { on = true; }
    }
    $$('.fx').forEach(particles);

    // Вселенная: звёзды, планеты, созвездия
    (() => {
        const cv = $('#uni'),
            ctx = cv.getContext('2d');
        let w, h, stars = [],
            on = false,
            mx = -999,
            my = -999;
        const size = () => { w = cv.width = cv.offsetWidth;
            h = cv.height = cv.offsetHeight;
            stars = Array.from({ length: innerWidth < 700 ? 70 : 140 }, () => ({ x: rnd(0, w), y: rnd(0, h), r: rnd(.5, 1.8), p: rnd(0, 6) })); };
        size();
        addEventListener('resize', size);
        const move = e => { const r = cv.getBoundingClientRect(),
                t = e.touches ? e.touches[0] : e;
            mx = t.clientX - r.left;
            my = t.clientY - r.top; };
        cv.parentElement.addEventListener('mousemove', move, { passive: true });
        cv.parentElement.addEventListener('touchmove', move, { passive: true });
        const planets = [{ r: .22, s: .0007, c: '#f4c6d0', z: 9 }, { r: .34, s: .0005, c: '#c0627f', z: 14 }, { r: .46, s: .0003, c: '#fbf1e6', z: 7 }];
        (function draw(t = 0) {
            if (on) {
                ctx.clearRect(0, 0, w, h);
                const cx = w / 2,
                    cy = h / 2,
                    m = Math.min(w, h);
                ctx.strokeStyle = '#f4c6d01a';
                ctx.lineWidth = 1;
                planets.forEach(p => { ctx.beginPath();
                    ctx.ellipse(cx, cy, p.r * m * 1.3, p.r * m * .6, 0, 0, 7);
                    ctx.stroke(); });
                stars.forEach(s => { ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t / 900 + s.p));
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, 7);
                    ctx.fill(); });
                const near = stars.filter(s => Math.hypot(s.x - mx, s.y - my) < 130);
                ctx.strokeStyle = '#f4c6d0';
                ctx.globalAlpha = .6;
                near.forEach((a, i) => { const b = near[i + 1]; if (b) { ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke(); } });
                planets.forEach((p, i) => { const a = t * p.s + i * 2;
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = p.c;
                    ctx.shadowColor = p.c;
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(a) * p.r * m * 1.3, cy + Math.sin(a) * p.r * m * .6, p.z, 0, 7);
                    ctx.fill();
                    ctx.shadowBlur = 0; });
            }
            if (!calm) requestAnimationFrame(draw);
        })();
        new IntersectionObserver(([e]) => on = e.isIntersecting).observe(cv);
        if (calm) on = true;
    })();

    // Причины
    $$('.rc').forEach(b => b.onclick = () => b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'));

    // Послания
    const phrases = ['С тобой даже тишина звучит красиво.', 'Ты — моё любимое «сегодня».', 'Твоя улыбка умеет останавливать время.', 'Рядом с тобой я становлюсь лучше.', 'Спасибо, что ты есть на свете.', 'Ты — свет, который не нужно включать.', 'В каждом дне есть место для мыслей о тебе.', 'Ты делаешь обычные вещи волшебными.', 'Пусть всё доброе в мире находит тебя первой.', 'Ты — причина верить в чудеса.', 'Твоё имя звучит как нежная мелодия.', 'Ты достойна самых красивых слов.'];
    let last = -1;
    const ph = $('#phrase');
    $('#morePhrase').onclick = () => {
        let i;
        do { i = Math.floor(Math.random() * phrases.length); } while (i === last);
        last = i;
        ph.style.opacity = 0;
        setTimeout(() => { ph.textContent = phrases[i];
            ph.style.opacity = 1; }, calm ? 0 : 300);
    };

    // Огни
    const lb = $('#lb'),
        lbBody = $('#lbBody');
    const openLb = f => { lbBody.replaceChildren(f.firstElementChild.cloneNode(true));
        lb.hidden = false;
        $('#lbClose').focus(); };
    $$('.ph').forEach(f => { f.onclick = () => openLb(f);
        f.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
                openLb(f); } }; });
    const closeLb = () => lb.hidden = true;
    $('#lbClose').onclick = closeLb;
    lb.onclick = e => { if (e.target === lb) closeLb(); };
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeLb();
            toggleMenu(false); } });

    // Таймер: дату вводит пользователь
    const when = $('#when'),
        clock = $('#clock'),
        note = $('#timeNote');
    let ts = null,
        tid;
    const pad = n => String(n);

    function run() {
        clearInterval(tid);
        const upd = () => {
            const d = Date.now() - ts;
            if (d < 0) { note.textContent = 'Эта дата ещё впереди — выбери момент из прошлого.';
                clock.hidden = true; return; }
            note.textContent = 'Каждая секунда — маленький подарок.';
            clock.hidden = false;
            $('#d').textContent = pad(Math.floor(d / 864e5));
            $('#h').textContent = pad(Math.floor(d / 36e5) % 24);
            $('#m').textContent = pad(Math.floor(d / 6e4) % 60);
            $('#s').textContent = pad(Math.floor(d / 1e3) % 60);
        };
        upd();
        tid = setInterval(upd, 1000);
    }
    $('#startTimer').onclick = () => {
        if (!when.value) { note.textContent = 'Сначала выбери дату и время.'; return; }
        ts = new Date(when.value).getTime();
        try { localStorage.setItem('shahina-date', when.value); } catch (e) {}
        run();
    };
    try { const v = localStorage.getItem('shahina-date'); if (v) { when.value = v;
            ts = new Date(v).getTime();
            run(); } } catch (e) {}

    // Всплеск сердечек
    function burst(x, y) {
        if (calm) return;
        for (let i = 0; i < 14; i++) {
            const s = document.createElement('span');
            s.textContent = '♥';
            s.style.cssText = `position:fixed;left:${x}px;top:${y}px;color:#e0708f;font-size:${rnd(14, 30)}px;pointer-events:none;z-index:97;transition:transform 1.2s ease-out,opacity 1.2s`;
            document.body.append(s);
            requestAnimationFrame(() => { s.style.transform = `translate(${rnd(-120, 120)}px,${rnd(-200, -60)}px) rotate(${rnd(-40, 40)}deg)`;
                s.style.opacity = 0; });
            setTimeout(() => s.remove(), 1300);
        }
    }
    const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

    // Сюрпризы
    $('#secretBtn').onclick = e => { $('#secret').classList.add('in');
        burst(e.clientX, e.clientY); };
    $('#env').onclick = e => { e.currentTarget.classList.toggle('open'); };
    $('#gift').onclick = e => { const g = e.currentTarget;
        g.classList.add('open');
        burst(...center(g));
        setTimeout(() => g.classList.remove('open'), 2500); };
    $('#finBtn').onclick = e => { for (let i = 0; i < 4; i++) setTimeout(() => burst(...center(e.currentTarget)), i * 200); };

    // Желание на ночном небе
    const wishes = ['Пусть каждый твой день будет светлее предыдущего.', 'Пусть рядом всегда будут те, кто тебя ценит.', 'Пусть все твои мечты находят дорогу к тебе.', 'Пусть улыбка не уходит с твоего лица.', 'Пусть тепло возвращается к тебе вдвое.', 'Пусть тебя окружают только добрые чудеса.'];
    const sky = $('#sky'),
        wt = $('#wishText');
    let wi = -1;
    const shoot = () => {
        const s = document.createElement('span');
        s.className = 'star';
        const y = rnd(10, sky.offsetHeight * .5);
        s.style.top = y + 'px';
        s.style.transform = 'translate(-100px,0) rotate(18deg)';
        sky.append(s);
        requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transform = `translate(${sky.offsetWidth + 100}px,${sky.offsetHeight * .5}px) rotate(18deg)`; }));
        setTimeout(() => s.remove(), 1400);
        do { wi = Math.floor(Math.random() * wishes.length); } while (wishes[wi] === wt.textContent);
        setTimeout(() => wt.textContent = wishes[wi], calm ? 0 : 900);
    };
    sky.onclick = shoot;
    sky.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
            shoot(); } };
})();