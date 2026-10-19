document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. MODO OSCURO / CLARO
    // =========================================
    const themeToggle = document.getElementById('themeToggle');
    const iconoTema = themeToggle.querySelector('i');
    const body = document.body;

    if (localStorage.getItem('tema') === 'dark') {
        body.classList.add('dark-mode');
        iconoTema.classList.replace('bi-moon-fill', 'bi-sun-fill');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            iconoTema.classList.replace('bi-moon-fill', 'bi-sun-fill');
            localStorage.setItem('tema', 'dark');
        } else {
            iconoTema.classList.replace('bi-sun-fill', 'bi-moon-fill');
            localStorage.setItem('tema', 'light');
        }
    });

    // =========================================
    // 2. EFECTO MÁQUINA DE ESCRIBIR (Typewriter)
    // =========================================
    const textoEscribir = "red de cómputo";
    const elementoTypewriter = document.getElementById('typewriter');
    let index = 0;
    let escribiendo = true;

    function efectoTypewriter() {
        if (escribiendo && index < textoEscribir.length) {
            elementoTypewriter.innerHTML += textoEscribir.charAt(index);
            index++;
            setTimeout(efectoTypewriter, 100);
        }
    }
    // Iniciar al cargar
    setTimeout(efectoTypewriter, 500);

    // =========================================
    // 3. FONDO ANIMADO (CANVAS)
    // =========================================
    const canvas = document.getElementById('canvas-red');
    const ctx = canvas.getContext('2d');
    let width, height, particulas = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particula {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = body.classList.contains('dark-mode') ? '#3b82f6' : '#94a3b8';
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particulas.push(new Particula());

    function animarRed() {
        ctx.clearRect(0, 0, width, height);
        particulas.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particulas.length; i++) {
            for (let j = i + 1; j < particulas.length; j++) {
                const dx = particulas[i].x - particulas[j].x;
                const dy = particulas[i].y - particulas[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particulas[i].x, particulas[i].y);
                    ctx.lineTo(particulas[j].x, particulas[j].y);
                    const color = body.classList.contains('dark-mode') ? '59, 130, 246' : '148, 163, 184';
                    ctx.strokeStyle = `rgba(${color}, ${1 - dist / 120})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animarRed);
    }
    animarRed();

    // =========================================
    // 4. SCROLL REVEAL Y BOTÓN VOLVER ARRIBA
    // =========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) entry.target.classList.add('active'); 
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const btnArriba = document.getElementById('btn-arriba');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btnArriba.style.display = 'flex';
        else btnArriba.style.display = 'none';
    });
    
    btnArriba.addEventListener('click', () => window.scrollTo(0,0));

    // =========================================
    // 5. LÓGICA DEL QUIZ
    // =========================================
    const preguntas = [
        { q: "¿Qué significa LAN?", options: ["Local Area Network", "Large Access Node", "Long Area Net"], a: 0 },
        { q: "¿Cuántos bits tiene una dirección IPv4?", options: ["64 bits", "32 bits", "128 bits"], a: 1 },
        { q: "¿Qué clase de red usa direcciones que empiezan con 192?", options: ["Clase A", "Clase B", "Clase C"], a: 2 },
        { q: "¿Qué dispositivo asigna direcciones IP automáticamente?", options: ["Switch", "Servidor DHCP", "Cable UTP"], a: 1 },
        { q: "¿Cuál es la máscara de subred por defecto para la Clase A?", options: ["255.0.0.0", "255.255.0.0", "255.255.255.0"], a: 0 }
    ];

    let currentQ = 0;
    let score = 0;
    let answered = false;

    const quizContainer = document.getElementById('quiz-container');
    const btnNext = document.getElementById('btn-quiz-next');
    const btnReiniciar = document.getElementById('btn-reiniciar');

    function cargarPregunta() {
        answered = false;
        btnNext.classList.add('d-none');
        const p = preguntas[currentQ];
        
        let html = `<h5 class="mb-4 fw-bold">${currentQ + 1}. ${p.q}</h5><div class="options">`;
        p.options.forEach((opt, i) => {
            html += `<div class="quiz-option" onclick="verificarRespuesta(${i}, this)">${opt}</div>`;
        });
        html += `</div>`;
        quizContainer.innerHTML = html;
    }

    window.verificarRespuesta = function(index, element) {
        if (answered) return;
        answered = true;
        const correctIndex = preguntas[currentQ].a;
        
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(opt => opt.style.pointerEvents = 'none');

        if (index === correctIndex) {
            element.classList.add('correct');
            score++;
        } else {
            element.classList.add('incorrect');
            options[correctIndex].classList.add('correct');
        }

        btnNext.classList.remove('d-none');
        if (currentQ === preguntas.length - 1) {
            btnNext.innerText = "Ver Resultados";
        }
    }

    btnNext.addEventListener('click', () => {
        currentQ++;
        if (currentQ < preguntas.length) {
            cargarPregunta();
        } else {
            quizContainer.classList.add('d-none');
            btnNext.classList.add('d-none');
            document.getElementById('quiz-result').classList.remove('d-none');
            document.getElementById('quiz-score').innerText = `Acertaste ${score} de ${preguntas.length} preguntas.`;
        }
    });

    btnReiniciar.addEventListener('click', () => {
        currentQ = 0; score = 0;
        document.getElementById('quiz-result').classList.add('d-none');
        quizContainer.classList.remove('d-none');
        cargarPregunta();
    });

    cargarPregunta();
});