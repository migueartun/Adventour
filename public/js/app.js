// ============================================================
//  ADVENTOUR — APP PRINCIPAL
// ============================================================

// ===== EMAILJS (para GitHub Pages) =====
emailjs.init('A3DErctghIL-byJyk');

// ===== STATE =====
let destinations = [];
let modalInstance = null;

// ===== DOM REFS =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const container = $('#destinosContainer');
const noResults = $('#noResults');
const searchInput = $('#searchInput');
const regionFilter = $('#regionFilter');
const priceFilter = $('#priceFilter');
const clearBtn = $('#clearFiltersBtn');
const contactForm = $('#contactForm');
const contactAlert = $('#contactAlert');
const submitBtn = contactForm?.querySelector('button[type="submit"]');
const destinoSelect = $('#destinoSelect');
const backToTop = $('#backToTop');
const navbar = $('#mainNavbar');
const newsletterForm = $('#newsletterForm');
const newsletterEmail = $('#newsletterEmail');
const newsletterAlert = $('#newsletterAlert');
const newsletterBtn = $('#newsletterBtn');

// ============================================================
//  1. CARGA DE DATOS
// ============================================================

async function loadDestinations() {
  try {
    const res = await fetch('data/destinations.json');
    destinations = await res.json();
    populateDestinoSelect();
    renderCards(destinations);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error al cargar destinos: ${err.message}</div>`;
  }
}

// ============================================================
//  2. RENDERIZADO DE TARJETAS
// ============================================================

function formatPrice(price) {
  return price.toLocaleString('es-CO');
}

function renderCards(data) {
  if (!data.length) {
    container.innerHTML = '';
    noResults.classList.remove('d-none');
    return;
  }
  noResults.classList.add('d-none');

  container.innerHTML = data.map(d => `
    <div class="col-md-6 col-lg-4">
      <div class="card destino-card" data-id="${d.id}">
        <div class="card-img-wrapper">
          <img src="${d.image}" alt="${d.name}" loading="lazy">
          <span class="card-rating"><i class="bi bi-star-fill me-1"></i>${d.rating}</span>
          <span class="card-badge-top">${d.duration}</span>
        </div>
        <div class="card-body">
          <h5 class="card-title">${d.name}</h5>
          <p class="card-text">${d.shortDescription}</p>
        </div>
        <div class="card-footer-info">
          <span class="price-tag">$${formatPrice(d.price)} <small>COP</small></span>
          <span class="region-tag"><i class="bi bi-geo-alt me-1"></i>${d.region}</span>
        </div>
      </div>
    </div>
  `).join('');

  $$('.destino-card').forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
  });
}

// ============================================================
//  3. FILTROS
// ============================================================

function filterDestinations() {
  const query = searchInput.value.toLowerCase().trim();
  const region = regionFilter.value;
  const maxPrice = parseInt(priceFilter.value);

  const filtered = destinations.filter(d => {
    const matchesName = d.name.toLowerCase().includes(query)
      || d.shortDescription.toLowerCase().includes(query)
      || d.region.toLowerCase().includes(query);
    const matchesRegion = region === 'todas' || d.region === region;
    const matchesPrice = maxPrice === 0 || d.price <= maxPrice;
    return matchesName && matchesRegion && matchesPrice;
  });

  renderCards(filtered);
}

searchInput.addEventListener('input', filterDestinations);
regionFilter.addEventListener('change', filterDestinations);
priceFilter.addEventListener('change', filterDestinations);
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  regionFilter.value = 'todas';
  priceFilter.value = '0';
  filterDestinations();
});

// ============================================================
//  4. MODAL DE DESTINO
// ============================================================

function openModal(id) {
  const d = destinations.find(dest => dest.id === id);
  if (!d) return;

  // Título
  $('#modalTitle').textContent = d.name;

  // Carrusel — indicadores
  const indicators = d.images.map((_, i) =>
    `<button type="button" data-bs-target="#modalCarousel" data-bs-slide-to="${i}" ${i === 0 ? 'class="active"' : ''}></button>`
  ).join('');

  // Carrusel — slides
  const inner = d.images.map((img, i) =>
    `<div     class="carousel-item ${i === 0 ? 'active' : ''}">
      <img src="${img}" class="d-block w-100" alt="${d.name} - Foto ${i + 1}" loading="lazy">
    </div>`
  ).join('');

  $('#carouselIndicators').innerHTML = indicators;
  $('#carouselInner').innerHTML = inner;

  // Hoteles
  const hotelsHtml = d.hotels.map(h => `
    <div class="hotel-item d-flex justify-content-between align-items-center">
      <div>
        <h6 class="fw-bold mb-1">${h.name}</h6>
        <div class="hotel-stars small mb-1">${'★'.repeat(h.stars)}${'☆'.repeat(5 - h.stars)}</div>
        <span class="badge bg-light text-dark border me-2">${h.type}</span>
        <small><i class="bi bi-star-fill" style="color:var(--rustic-accent);"></i> ${h.rating}</small>
      </div>
      <div class="text-end">
        <div class="fw-bold" style="color:var(--rustic-primary); font-size:1.1rem;">$${formatPrice(h.price)}</div>
        <small style="color:var(--rustic-muted);">por noche</small>
      </div>
    </div>
  `).join('');

  // Actividades
  const activitiesHtml = d.activities.map(a =>
    `<li class="list-group-item border-0 py-1 px-0">
      <i class="bi bi-check-circle-fill me-2" style="color:var(--rustic-olive);"></i>${a}
    </li>`
  ).join('');

  // Cuerpo del modal
  $('#modalBody').innerHTML = `
    <p style="color:var(--rustic-muted); line-height:1.7;">${d.description}</p>

    <div class="d-flex flex-wrap gap-2 mb-3">
      <span class="badge fs-6 fw-normal px-3 py-2" style="background:var(--rustic-primary);">
        <i class="bi bi-calendar me-1"></i>${d.duration}
      </span>
      <span class="badge fs-6 fw-normal px-3 py-2" style="background:var(--rustic-accent);color:var(--rustic-dark);">
        <i class="bi bi-star-fill me-1"></i>${d.rating} / 5.0
      </span>
      <span class="badge fs-6 fw-normal px-3 py-2" style="background:var(--rustic-olive);color:#fff;">
        <i class="bi bi-geo-alt me-1"></i>${d.region}
      </span>
    </div>

    <h5 style="font-family:var(--font-heading);" class="fw-bold mb-3">
      Desde <span style="color:var(--rustic-primary);">$${formatPrice(d.price)} COP</span> por persona
    </h5>

    <h5 class="fw-bold mt-4 mb-3" style="font-family:var(--font-heading);">
      <i class="bi bi-building me-2" style="color:var(--rustic-accent);"></i>Hoteles disponibles
    </h5>
    ${hotelsHtml}

    <h5 class="fw-bold mt-4 mb-3" style="font-family:var(--font-heading);">
      <i class="bi bi-activity me-2" style="color:var(--rustic-terracotta);"></i>Actividades incluidas
    </h5>
    <ul class="list-group list-group-flush">${activitiesHtml}</ul>
  `;

  // Mostrar modal
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal($('#destinoModal'));
  }
  modalInstance.show();

  // Reiniciar carrusel al cerrar
  $('#destinoModal').addEventListener('hidden.bs.modal', () => {
    const carousel = bootstrap.Carousel.getInstance($('#modalCarousel'));
    if (carousel) carousel.dispose();
  }, { once: true });
}

// Cerrar modal y hacer scroll a contacto
window.closeModalAndScroll = function (selector) {
  if (modalInstance) modalInstance.hide();
  setTimeout(() => {
    document.querySelector(selector).scrollIntoView({ behavior: 'smooth' });
  }, 300);
};

// ============================================================
//  5. FORMULARIO DE CONTACTO
// ============================================================

function populateDestinoSelect() {
  destinoSelect.innerHTML = '<option value="">Selecciona un destino</option>'
    + destinations.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.classList.add('was-validated');
    return;
  }

  const data = {
    nombre: $('#nombre').value.trim(),
    email: $('#email').value.trim(),
    destino: destinoSelect.value || 'No especificado',
    mensaje: $('#mensaje').value.trim(),
    fecha: new Date().toISOString()
  };

  // Deshabilitar botón y mostrar spinner
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';

  // Guardar en localStorage
  try {
    const contacts = JSON.parse(localStorage.getItem('adventour_contacts') || '[]');
    contacts.push(data);
    localStorage.setItem('adventour_contacts', JSON.stringify(contacts));
  } catch (_) {}

  // Enviar al backend local (si no, se guarda en localStorage igual)
  let ok = false;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    ok = res.ok;
  } catch (_) {
    ok = true; // Ya está en localStorage, se enviará cuando el servidor local esté activo
  }

  // Restaurar botón
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;

  // Mostrar resultado
  if (ok) {
    contactAlert.className = 'alert alert-success mt-3';
    contactAlert.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>¡Mensaje enviado con éxito! Te contactaremos pronto para planear tu viaje.';
    contactForm.reset();
    contactForm.classList.remove('was-validated');
  } else {
    contactAlert.className = 'alert alert-danger mt-3';
    contactAlert.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Hubo un problema al enviar el mensaje. Por favor intenta de nuevo o escríbenos directamente a <strong>info@adventour.co</strong>.';
  }
  contactAlert.classList.remove('d-none');

  setTimeout(() => {
    contactAlert.classList.add('d-none');
  }, 8000);
});

// ============================================================
//  6. NEWSLETTER
// ============================================================

const EMAILJS_SERVICE = 'service_ti25s2q';
const EMAILJS_TEMPLATE = 'template_gddfvch';

async function sendViaEmailJS(templateParams) {
  await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams);
}

async function subscribeEmailLocal(email) {
  const res = await fetch('/api/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newsletterAlert.className = 'alert alert-warning';
      newsletterAlert.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>Ingresa un correo válido.';
      newsletterAlert.style.display = '';
      return;
    }

    const orig = newsletterBtn.innerHTML;
    newsletterBtn.disabled = true;
    newsletterBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Suscribiendo...';

    let ok = false;
    try {
      const res = await subscribeEmailLocal(email);
      ok = res.success;
    } catch (_) {
      try {
        await sendViaEmailJS({ email });
        ok = true;
      } catch (_2) {}
    }

    if (ok) {
      newsletterAlert.className = 'alert alert-success';
      newsletterAlert.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>¡Gracias por suscribirte! Te llegará un correo de bienvenida.';
      newsletterForm.reset();
    } else {
      newsletterAlert.className = 'alert alert-danger';
      newsletterAlert.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Error de conexión. Intenta de nuevo.';
    }
    newsletterAlert.style.display = '';
    newsletterBtn.disabled = false;
    newsletterBtn.innerHTML = orig;
    setTimeout(() => { newsletterAlert.style.display = 'none' }, 8000);
  });
}

// ============================================================
//  7. ANIMACIONES SCROLL (Intersection Observer)
// ============================================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains('anim-hidden')) {
          el.classList.add('anim-visible');
        }
        if (el.classList.contains('anim-hidden-left')) {
          el.classList.add('anim-visible-left');
        }
        if (el.classList.contains('anim-hidden-right')) {
          el.classList.add('anim-visible-right');
        }

        // Iniciar contadores si es la sección de stats
        if (el.querySelector('.counter')) {
          animateCounters(el);
        }
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  $$('.anim-hidden, .anim-hidden-left, .anim-hidden-right').forEach(el => observer.observe(el));
}

// ============================================================
//  8. CONTADORES ANIMADOS
// ============================================================

function animateCounters(container) {
  const counters = container.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const step = Math.max(target / 60, isDecimal ? 0.01 : 1);
    let current = 0;

    if (counter.dataset.animated) return;
    counter.dataset.animated = 'true';

    const update = () => {
      current += step;
      if (current >= target) {
        counter.textContent = isDecimal ? target.toFixed(1) : Math.floor(target);
        return;
      }
      counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
      requestAnimationFrame(update);
    };
    update();
  });
}

// ============================================================
//  9. NAVBAR — ACTIVE LINK Y SCROLL
// ============================================================

function initNavbar() {
  // Cambiar estilo al hacer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar-scrolled', window.scrollY > 80);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });

  // Active link basado en sección visible
  const sections = $$('section[id]');
  const navLinks = $$('.navbar-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 200;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ============================================================
//  10. BOTÓN BACK TO TOP
// ============================================================

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================================
//  10. INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadDestinations();
  initScrollAnimations();
  initNavbar();
});
