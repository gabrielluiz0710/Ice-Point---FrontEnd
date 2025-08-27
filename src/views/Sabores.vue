<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

// onMounted garante que todo o código abaixo só execute depois que o HTML do componente estiver na tela.
onMounted(() => {
  // --- FUNÇÕES DE LIMPEZA (para o onUnmounted) ---
  let observer: IntersectionObserver;
  const listeners: { element: EventTarget; type: string; handler: EventListener }[] = [];

  const addListener = (element: EventTarget, type: string, handler: EventListener) => {
    element.addEventListener(type, handler);
    listeners.push({ element, type, handler });
  };

  // --- LÓGICA ORIGINAL ---
  window.scrollTo(0, 0);

  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const categorySelect = document.getElementById('categorySelect') as HTMLSelectElement;
  const tabButtons = document.querySelectorAll('.tab-button');
  const productCards = document.querySelectorAll('.product-card');
  const scrollToTopBtn = document.getElementById('scrollToTopBtn') as HTMLElement;
  const noResultsMessage = document.getElementById('noResultsMessage') as HTMLElement;
  const saboresSection = document.querySelector('#sabores') as HTMLElement;
  const hero = document.querySelector(".hero") as HTMLElement;

  const categoryDisplayNames: Record<string, string> = {};
  tabButtons.forEach(button => {
    const btn = button as HTMLElement;
    const categoryKey = btn.dataset.category!;
    const displayName = btn.textContent!;
    categoryDisplayNames[categoryKey] = displayName;
  });

  const wrapper = document.querySelector('.custom-select-wrapper');
  if (wrapper && categorySelect) {
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';

    const options = document.createElement('div');
    options.className = 'custom-options';

    const container = document.createElement('div');
    container.className = 'custom-select-container';

    Array.from(categorySelect.options).forEach(option => {
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;
      options.appendChild(customOption);
    });

    container.appendChild(trigger);
    container.appendChild(options);
    wrapper.appendChild(container);

    const updateTriggerText = () => {
      trigger.textContent = categorySelect.options[categorySelect.selectedIndex].textContent;
    }

    const handleTriggerClick = () => container.classList.toggle('open');

    const handleOptionClick = (event: Event) => {
      const option = event.currentTarget as HTMLElement;
      options.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      categorySelect.value = option.dataset.value!;
      updateTriggerText();
      container.classList.remove('open');

      categorySelect.dispatchEvent(new Event('change'));
    };

    const handleWindowClick = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        container.classList.remove('open');
      }
    };

    addListener(trigger, 'click', handleTriggerClick);
    options.querySelectorAll('.custom-option').forEach(option => {
      addListener(option, 'click', handleOptionClick as EventListener);
    });
    addListener(window, 'click', handleWindowClick as EventListener);

    updateTriggerText();
  }

  const filterAndDisplayProducts = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    let visibleProductsCount = 0;

    tabButtons.forEach(btn => {
      const button = btn as HTMLElement;
      if (button.dataset.category === selectedCategory) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });

    productCards.forEach(card => {
      const cardEl = card as HTMLElement;
      const productName = cardEl.querySelector('h3')!.textContent!.toLowerCase();
      const productCategory = Array.from(cardEl.classList).find(cls => cls !== 'product-card' && cls !== 'visible');

      let categoryElement = cardEl.querySelector('.product-card-category') as HTMLElement;
      if (!categoryElement) {
        categoryElement = document.createElement('p');
        categoryElement.className = 'product-card-category';
        cardEl.querySelector('h3')!.insertAdjacentElement('afterend', categoryElement);
      }

      const categoryMatch = selectedCategory === 'all' || productCategory === selectedCategory;
      const searchMatch = productName.includes(searchTerm);

      if (categoryMatch && searchMatch) {
        cardEl.style.display = 'block';
        visibleProductsCount++;

        if (selectedCategory === 'all') {
          const formattedCategory = categoryDisplayNames[productCategory!] || productCategory;
          categoryElement.textContent = formattedCategory!;
          categoryElement.style.display = 'block';
        } else {
          categoryElement.style.display = 'none';
        }

      } else {
        cardEl.style.display = 'none';
        categoryElement.style.display = 'none';
      }
    });

    if (noResultsMessage) {
      noResultsMessage.style.display = visibleProductsCount === 0 ? 'block' : 'none';
    }
  }

  const handleScroll = () => {
    if (saboresSection && window.scrollY > saboresSection.offsetTop) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  };

  const handleTabButtonClick = (event: Event) => {
    const button = event.currentTarget as HTMLElement;
    const category = button.dataset.category;
    categorySelect.value = category!;
    categorySelect.dispatchEvent(new Event('change'));
    const trigger = document.querySelector('.custom-select-trigger');
    if (trigger) {
      trigger.textContent = categoryDisplayNames[category!] || "Todas as Categorias";
    }
  };

  const handleScrollToTopClick = (event: Event) => {
    event.preventDefault();
    saboresSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroMouseMove = (e: MouseEvent) => {
    const heroContent = hero.querySelector(".hero-content") as HTMLElement;
    const heroIceCream = hero.querySelector(".hero-ice-cream") as HTMLElement;
    const x = e.clientX;
    const y = e.clientY;
    const moveX = (x - window.innerWidth / 2) / 40;
    const moveY = (y - window.innerHeight / 2) / 40;

    if (heroContent) {
      heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
    if (heroIceCream) {
      heroIceCream.style.transform = `translate(calc(-50% + ${-moveX}px), calc(-50% + ${-moveY}px))`;
    }
  };

  const coresSabor: Record<string, string> = {
    abacaxi: "#fce181",
    "abacaxi ao vinho": "#eeb1e6ff",
    prestígio: "#f2d6c4ff",
    ameixa: "#b36f2fff",
    amendoim: "#d2a679",
    banana: "#fff6a2ff",
    "blue ice": "#3498db",
    bombom: "#c48048ff",
    chiclete: "#ff7edb",
    chocolate: "#7b3f00",
    "chocolate branco": "#fcffd2ff",
    chocomenta: "#98d9b6",
    coco: "#dfdfdfff",
    "coco queimado": "#a1724b",
    creme: "#ffd986ff",
    cupuaçu: "#f1eadbff",
    "doce de leite": "#c68642",
    flocos: "#f5f5dc",
    "frutas vermelhas": "#e08393ff",
    "iogurte com maracujá": "#e6d084ff",
    "leite condensado": "#fffacaff",
    "leite ninho": "#fff5e6ff",
    "leite ninho trufado": "#fff5e6ff",
    limão: "#d8e6a2ff",
    maracujá: "#ffc40c",
    "milho verde": "#fbec5d",
    "morango com iogurte": "#fc5a8d",
    "passas ao rum": "#dbcd4fff",
    "romeu e julieta": "#fddde6",
    sensação: "#fe758f",
    "torta alemã": "#eaddca",
    uva: "#6f2da8",
    abacate: "#8db600",
    cajá: "#ffbf00",
    kiwi: "#8ee53f",
    goiaba: "#f88379",
    "limão suíço": "#c9cc99",
    churros: "#f4a460",
    coalhada: "#fff8dc",
    nata: "#fff5e6",
    queijo: "#fffacd",
    "uva ao leite": "#b19cd9",
    acerola: "#ff0033",
    "cajá-manga": "#ffba61ff",
    groselha: "#ff1cae",
    laranja: "#ffa500",
    "pinta língua": "#2c47dfff",
    tamarindo: "#ff7518",
  };

  const applyColors = () => {
    document.querySelectorAll(".product-card.sorvetes").forEach((card) => {
      const sabor = card.querySelector("h3")!.textContent!.toLowerCase();
      const iconScoop = card.querySelector(".scoop-part") as HTMLElement;
      if (iconScoop && coresSabor[sabor]) {
        iconScoop.style.color = coresSabor[sabor];
      }
    });

    document.querySelectorAll('.product-card.picole-leite, .product-card.picole-fruta').forEach((card) => {
      const sabor = card.querySelector("h3")!.textContent!.toLowerCase().replace(' suíço', 'suico');
      const icon = card.querySelector(".custom-popsicle-icon path") as HTMLElement;
      if (icon && coresSabor[sabor]) {
        icon.style.fill = coresSabor[sabor];
      }
    });

    document.querySelectorAll(".product-card.ituzinho").forEach((card) => {
      const sabor = card.querySelector("h3")!.textContent!.toLowerCase();
      const icon = card.querySelector(".ituzinho-icon path") as HTMLElement;
      if (icon && coresSabor[sabor]) {
        icon.style.fill = coresSabor[sabor];
      }
    });

    document.querySelectorAll(".product-card.skimo").forEach((card) => {
      const sabor = card.querySelector("h3")!.textContent!.toLowerCase();
      const icon = card.querySelector(".skimo-icon .inner-ice-cream") as HTMLElement;
      if (icon && coresSabor[sabor]) {
        icon.style.fill = coresSabor[sabor];
      }
    });
  };

  addListener(window, 'scroll', handleScroll);
  addListener(searchInput, 'input', filterAndDisplayProducts);
  addListener(categorySelect, 'change', filterAndDisplayProducts);
  tabButtons.forEach(button => {
    addListener(button, 'click', handleTabButtonClick as EventListener);
  });
  addListener(scrollToTopBtn, 'click', handleScrollToTopClick);
  if (hero) {
    addListener(hero, "mousemove", handleHeroMouseMove as EventListener);
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  productCards.forEach(card => observer.observe(card));

  filterAndDisplayProducts();
  applyColors();

  // onUnmounted será responsável por limpar todos os listeners
  onUnmounted(() => {
    listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    if (observer) {
      observer.disconnect();
    }
  });
});
</script>

<template>
  <header>
    <div class="container">
      <a href="https://icepoint.vercel.app/"><img src="/sabores/images/logo_horizontal.png"
          alt="Ice Point Sorveteria" /></a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="hero-content">
        <h1>Felicidade em Forma de Sorvete!</h1>
        <p>
          Picolés cremosos, sorvetes irresistíveis e o melhor açaí da cidade!
          Qual delícia vai alegrar o seu dia hoje?
        </p>
        <a href="#sabores" class="cta-button">Quero Ver os Sabores!</a>
      </div>

      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape sprinkle shape-3"></div>
      <div class="floating-shape triangle shape-4"></div>
      <div class="floating-shape shape-5"></div>
      <div class="floating-shape sprinkle shape-6"></div>
      <div class="floating-shape shape-7"></div>
      <div class="floating-shape triangle shape-8"></div>
      <div class="floating-shape sprinkle shape-9"></div>
      <div class="floating-shape shape-10"></div>
      <div class="floating-shape triangle shape-11"></div>
      <div class="floating-shape sprinkle shape-12"></div>
    </section>

    <section id="sabores" class="products-section">
      <div class="container">
        <h2>Nossos Sabores Irresistíveis</h2>

        <div class="tabs">
          <button class="tab-button active" data-category="all">Todos</button>
          <button class="tab-button" data-category="picole-leite">Picolé ao Leite</button>
          <button class="tab-button" data-category="picole-fruta">Picolé de Fruta</button>
          <button class="tab-button" data-category="ituzinho">Ituzinho</button>
          <button class="tab-button" data-category="skimo">Skimó</button>
          <button class="tab-button" data-category="sorvetes">Sorvetes</button>
          <button class="tab-button" data-category="zero">Zero Açúcar</button>
          <button class="tab-button" data-category="acai">Açaí</button>
        </div>

        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Digite o sabor que você procura...">
          <div class="custom-select-wrapper">

            <select id="categorySelect">
              <option value="all" selected>Todas as Categorias</option>
              <option value="picole-leite">Picolé ao Leite</option>
              <option value="picole-fruta">Picolé de Fruta</option>
              <option value="ituzinho">Ituzinho</option>
              <option value="skimo">Skimó</option>
              <option value="sorvetes">Sorvetes</option>
              <option value="zero">Zero Açúcar</option>
              <option value="acai">Açaí</option>
            </select>
          </div>
        </div>

        <div id="noResultsMessage" style="text-align: center; padding: 20px; display: none; width: 100%;">
          <h3>Nenhum resultado encontrado para sua busca.</h3>
        </div>

        <!-- SORVETES -->

        <div class="products-grid">
          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Abacaxi</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Abacaxi ao Vinho</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Ameixa</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Amendoim</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Banana</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Blue Ice</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Bombom</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Chiclete</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Chocolate</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Chocolate Branco</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Chocomenta</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Coco</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Coco Queimado</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Creme</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Cupuaçu</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Doce de Leite</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Flocos</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Frutas Vermelhas</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Iogurte com Maracujá</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Leite Condensado</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Leite Ninho</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Leite Ninho Trufado</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Limão</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Maracujá</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Milho Verde</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Morango com Iogurte</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Passas ao Rum</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Prestígio</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Sensação</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Torta Alemã</h3>
          </div>

          <div class="product-card sorvetes" style="display: none">
            <div class="product-visual">
              <span class="fa-stack">
                <i class="fas fa-ice-cream fa-stack-1x cone-part"></i>
                <i class="fas fa-ice-cream fa-stack-1x scoop-part"></i>
              </span>
            </div>
            <h3>Uva</h3>
          </div>

          <!-- PICOLÉ DE LEITE -->

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/acai.png" alt="Picolé de Açaí da Ice Point" />
            </div>
            <h3>Açaí</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Abacate</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/abacaxisuico.png" alt="Picolé de Abacaxi Suíço da Ice Point" />
            </div>
            <h3>Abacaxi Suíço</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/ameixa.png" alt="Picolé de Ameixa da Ice Point" />
            </div>
            <h3>Ameixa</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/amendoim.png" alt="Picolé de Amendoim da Ice Point" />
            </div>
            <h3>Amendoim</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/banana.png" alt="Picolé de Banana da Ice Point" />
            </div>
            <h3>Banana</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/blueice.png" alt="Picolé de Blue Ice da Ice Point" />
            </div>
            <h3>Blue Ice</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Bombom</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Cajá</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Chiclete</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/chocolate.png" alt="Picolé de Chocolate da Ice Point" />
            </div>
            <h3>Chocolate</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Chocolate Branco</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Chocomenta</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Churros</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Coalhada</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/coco.png" alt="Picolé de Coco da Ice Point" />
            </div>
            <h3>Coco</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/cocoqueimado.png" alt="Picolé de Coco Queimado da Ice Point" />
            </div>
            <h3>Coco Queimado</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/creme.png" alt="Picolé de Creme da Ice Point" />
            </div>
            <h3>Creme</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/cupuacu.png" alt="Picolé de Cupuaçu da Ice Point" />
            </div>
            <h3>Cupuaçu</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Doce de Leite</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Flocos</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/goiaba.png" alt="Picolé de Goiaba da Ice Point" />
            </div>
            <h3>Goiaba</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/iogurtemorango.png"
                alt="Picolé de Iogurte com Morango da Ice Point" />
            </div>
            <h3>Iogurte com Morango</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Kiwi</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/leitecondensado.png"
                alt="Picolé de Leite Condensado da Ice Point" />
            </div>
            <h3>Leite Condensado</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Leite Ninho</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/limaosuico.png" alt="Picolé de Limão Suíço da Ice Point" />
            </div>
            <h3>Limão Suíço</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Maracujá</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/milho.png" alt="Picolé de Milho Verde da Ice Point" />
            </div>
            <h3>Milho Verde</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <img src="/sabores/images/picole-leite/morangoleite.png" alt="Picolé de Morango da Ice Point" />
            </div>
            <h3>Morango</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Nata</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Queijo</h3>
          </div>

          <div class="product-card picole-leite">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Uva ao Leite</h3>
          </div>

          <!-- PICLÉ DE FRUTA -->

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <img src="/sabores/images/picole-fruta/abacaxi.png" alt="Picolé de Abacaxi da Ice Point" />
            </div>
            <h3>Abacaxi</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Acerola</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Cajá-manga</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Groselha</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Kiwi</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Laranja</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Limão</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Maracujá</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Morango</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Pinta Língua</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Tamarindo</h3>
          </div>

          <div class="product-card picole-fruta" style="display: none">
            <div class="product-visual">
              <svg class="custom-popsicle-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <rect x="33" y="105" width="14" height="35" rx="4" />
              </svg>
            </div>
            <h3>Uva</h3>
          </div>

          <!-- SORVETE ZERO -->

          <div class="product-card zero" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-leaf"></i>
            </div>
            <h3> Sorvete de Chocolate</h3>
          </div>

          <div class="product-card zero" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-leaf"></i>
            </div>
            <h3>Sorvete de Coco</h3>
          </div>

          <div class="product-card zero" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-leaf"></i>
            </div>
            <h3>Sorvete de Frutas Vermelhas</h3>
          </div>

          <div class="product-card zero" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-leaf"></i>
            </div>
            <h3>Sorvete de Morango</h3>
          </div>

          <!-- AÇAI -->

          <div class="product-card acai" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-bowl-rice"></i>
            </div>
            <h3>Açaí Tradicional</h3>
          </div>

          <div class="product-card acai" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-bowl-rice"></i>
            </div>
            <h3>Açaí de Morango</h3>
          </div>

          <div class="product-card acai" style="display: none">
            <div class="product-visual">
              <i class="fa-solid fa-bowl-rice"></i>
            </div>
            <h3>Açaí de Banana</h3>
          </div>

          <!-- ITUZINHO -->

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <svg class="ituzinho-icon" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z" />
              </svg>
            </div>
            <h3>Chocolate</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <svg class="ituzinho-icon" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z" />
              </svg>
            </div>
            <h3>Chocolate Branco</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <svg class="ituzinho-icon" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z" />
              </svg>
            </div>
            <h3>Coco</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <img src="/sabores/images/picole-ituzinho/ituleitecondensado.png"
                alt="Ituzinho de Leite Condensado da Ice Point" />
            </div>
            <h3>Leite Condensado</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <svg class="ituzinho-icon" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z" />
              </svg>
            </div>
            <h3>Limão</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <img src="/sabores/images/picole-ituzinho/itumaracuja.png" alt="Ituzinho de Maracujá da Ice Point" />
            </div>
            <h3>Maracujá</h3>
          </div>

          <div class="product-card ituzinho" style="display: none">
            <div class="product-visual">
              <svg class="ituzinho-icon" viewBox="0 0 60 160" xmlns="http://www.w3.org/2000/svg">
                <rect x="24" y="120" width="12" height="40" rx="4" />
                <path
                  d="M10,125 Q-5,105 10,85 Q-5,65 10,45 Q-5,25 10,5 C10,-5 50,-5 50,5 Q65,25 50,45 Q65,65 50,85 Q65,105 50,125 Z" />
              </svg>
            </div>
            <h3>Morango</h3>
          </div>

          <!-- PICOLÉ SKIMO -->

          <div class="product-card skimo" style="display: none">
            <div class="product-visual">
              <svg class="skimo-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <rect class="stick" x="33" y="105" width="14" height="35" rx="4" />
                <path class="inner-ice-cream" d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <path class="chocolate-shell" d="M10,110 V50 C10,10 70,10 70,50 V40 C50,35 55,70 70,75 V110 H10 Z" />
              </svg>
            </div>
            <h3>Bombom</h3>
          </div>

          <div class="product-card skimo" style="display: none">
            <div class="product-visual">
              <img src="/sabores/images/picole-skimo/brigadeiro.png" alt="Skimó de Brigadeiro da Ice Point" />
            </div>
            <h3>Brigadeiro</h3>
          </div>

          <div class="product-card skimo" style="display: none">
            <div class="product-visual">
              <svg class="skimo-icon" viewBox="0 0 80 140" xmlns="http://www.w3.org/2000/svg">
                <rect class="stick" x="33" y="105" width="14" height="35" rx="4" />
                <path class="inner-ice-cream" d="M10,50 C10,10 70,10 70,50 V 110 H 10 Z" />
                <path class="chocolate-shell" d="M10,110 V50 C10,10 70,10 70,50 V40 C50,35 55,70 70,75 V110 H10 Z" />
              </svg>
            </div>
            <h3>Coco</h3>
          </div>

          <div class="product-card skimo" style="display: none">
            <div class="product-visual">
              <img src="/sabores/images/picole-skimo/tentacao.png" alt="Skimó de Tentação da Ice Point" />
            </div>
            <h3>Tentação</h3>
          </div>

        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-column footer-col-logo">
          <img class="footer-logo" src="/sabores/images/logo_full.png" alt="Ice Point Sorveteria Logo" />
        </div>

        <div class="footer-column">
          <h4>Contato e Endereço</h4>
          <p>
            <i class="fas fa-map-marker-alt"></i>&nbsp;Av. Padre Eddie
            Bernardes da Silva, 965 - Lourdes, Uberaba - MG
          </p>
          <p><i class="fas fa-phone"></i>&nbsp;(34) 99965-8035</p>
        </div>

        <div class="footer-column">
          <h4>Funcionamento</h4>
          <p>
            <i class="fas fa-clock"></i>&nbsp;Aberto todos os dias: 11h - 20h
          </p>
          <div class="social-icons">
            <a href="https://www.instagram.com/icepointuberaba" aria-label="Instagram"><i
                class="fab fa-instagram"></i></a>
            <a href="https://api.whatsapp.com/send?phone=5534999658035" aria-label="WhatsApp"><i
                class="fab fa-whatsapp"></i></a>
            <a href="https://web.facebook.com/IcePointUberaba?_rdc=1&_rdr#" aria-label="Facebook"><i
                class="fab fa-facebook"></i></a>
            <a href="https://x.com/IcePointUberaba" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://maps.app.goo.gl/gSa8CsRqCBpGfaVA9" aria-label="Localização"><i
                class="fas fa-map-marked-alt"></i></a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Ice Point Sorveteria. Todos os direitos reservados.</p>
    </div>
  </footer>

  <a href="#sabores" id="scrollToTopBtn" aria-label="Voltar para Sabores">
    <i class="fas fa-arrow-up"></i>
  </a>
</template>

<style scoped>
:root {
  --c-rosa: #fe758f;
  --c-rosa-dark: #da6076;
  --c-azul: #19c5cb;
  --c-azul-footer: #23b1c9;
  --c-azul-dark-footer: #198c9f;
  --c-branco: #ffffff;
  --c-bege: #fdf5e6;
  --c-text-dark: #343434;
  --c-amarelo: #ffd166;
  --font-title: "Baloo 2", cursive;
  --font-body: "Poppins", sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background: white;
  color: var(--c-text-dark);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background-color: var(--c-branco);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

header .container {
  display: flex;
  justify-content: center;
  align-items: center;
}

header img {
  max-height: 40px;
  width: auto;
}

.hero {
  min-height: calc(100vh - 72px);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-size: 400% 400%;
  background-image: linear-gradient(-45deg,
      var(--c-rosa),
      hsl(349, 100%, 78%),
      var(--c-rosa-dark));
  animation: animated-gradient 8s ease infinite;
}

.cta-button {
  margin-top: 30px;
  background-color: var(--c-branco);
  color: var(--c-rosa-dark);
  padding: 15px 30px;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.3s ease, background-color 0.3s ease;
  border: 2px solid var(--c-rosa);
  display: inline-block;
}

@keyframes animated-gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-content h1 {
  animation: bounce-in 1s ease-out forwards;
  color: var(--c-branco);
  font-weight: 900;
  font-size: 60px;
}

.hero-content p {
  animation: bounce-in 1s ease-out 0.2s forwards;
  opacity: 100;
  color: var(--c-branco);
  margin-top: 20px;
  margin-left: 18%;
  margin-right: 18%;
  font-weight: 400;
  font-size: 20px;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }

  60% {
    opacity: 1;
    transform: translateY(10px) scale(1.05);
  }

  80% {
    transform: translateY(-5px) scale(0.95);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cta-button:hover {
  animation: button-pulse 1.5s ease;
}

@keyframes button-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.7);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%);
  }

  50% {
    transform: translate(-50%, -55%);
  }

  100% {
    transform: translate(-50%, -50%);
  }
}

.floating-shape {
  position: absolute;
  display: block;
  z-index: 1;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  opacity: 0;
}

.sprinkle {
  width: 8px;
  height: 25px;
  border-radius: 4px;
}

.triangle {
  width: 0;
  height: 0;
  background-color: transparent !important;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
}

@keyframes tumble-and-float {
  0% {
    transform: translateY(-20vh) translateX(0) rotate(0deg);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateY(120vh) translateX(var(--random-x, 20px)) rotate(var(--random-rot, 720deg));
    opacity: 0;
  }
}

.shape-1 {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--c-branco);
  left: 10%;
  animation: tumble-and-float 8s infinite;
}

.shape-2 {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-azul);
  left: 20%;
  animation: tumble-and-float 12s infinite 2s;
}

.shape-3 {
  background: var(--c-amarelo);
  left: 30%;
  animation: tumble-and-float 7s infinite 1s;
}

.shape-4 {
  border-bottom: 25px solid var(--c-rosa);
  left: 40%;
  animation: tumble-and-float 10s infinite;
}

.shape-5 {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--c-branco);
  left: 50%;
  animation: tumble-and-float 6s infinite 3s;
}

.shape-6 {
  background: var(--c-azul);
  left: 60%;
  animation: tumble-and-float 9s infinite;
}

.shape-7 {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--c-rosa-dark);
  left: 70%;
  animation: tumble-and-float 11s infinite 2s;
}

.shape-8 {
  border-bottom: 25px solid var(--c-amarelo);
  left: 80%;
  animation: tumble-and-float 7s infinite;
}

.shape-9 {
  background: var(--c-branco);
  left: 90%;
  animation: tumble-and-float 13s infinite 1s;
}

.shape-10 {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c-rosa);
  left: 5%;
  animation: tumble-and-float 8s infinite 4s;
}

.shape-11 {
  border-bottom: 20px solid var(--c-azul);
  left: 55%;
  animation: tumble-and-float 10s infinite;
}

.shape-12 {
  background: var(--c-rosa-dark);
  left: 85%;
  animation: tumble-and-float 6s infinite 2s;
}

@keyframes animate-shape {
  0% {
    transform: translateY(110vh) translateX(0) rotate(0deg);
    opacity: 1;
  }

  50% {
    transform: translateY(50vh) translateX(40px) rotate(360deg);
  }

  100% {
    transform: translateY(-10vh) translateX(-40px) rotate(720deg);
    opacity: 0;
  }
}

.products-section {
  padding: 80px 0;
  text-align: center;
}

.products-section h2 {
  font-family: var(--font-title);
  font-size: 2.8rem;
  color: var(--c-text-dark);
  margin-bottom: 40px;
}

.tabs {
  margin-bottom: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.tab-button {
  background: none;
  border: 2px solid var(--c-azul);
  color: var(--c-azul);
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: var(--c-azul);
  color: var(--c-branco);
}

.tab-button.active {
  background-color: var(--c-azul);
  color: var(--c-branco);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  background-color: var(--c-branco);
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  opacity: 0;
  transform: translateY(30px);
}

.product-card.visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(254, 117, 143, 0.2);
}

.product-visual {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
}

.product-visual i {
  font-size: 3.5rem;
  color: var(--c-rosa);
}

.product-visual img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-card:hover .product-visual {
  transform: scale(1.2) rotate(-15deg);
}

.product-card h3 {
  font-family: var(--font-body);
  font-size: 1.2rem;
  color: var(--c-text-dark);
}

footer {
  background-color: var(--c-azul-footer);
  color: rgba(255, 255, 255, 0.9);
  padding-top: 80px;
  margin-top: 80px;
  font-size: 0.9rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
  align-items: center;
}

.footer-column {
  flex: 1;
  min-width: 250px;
}

.footer-column h4 {
  font-family: var(--font-title);
  font-size: 1.4rem;
  color: var(--c-branco);
  margin-bottom: 15px;
}

.footer-column p {
  line-height: 1.6;
  margin-bottom: 10px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
}

.footer-column p i {
  margin-top: 5px;
  margin-right: 5px;
}

.footer-col-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-logo {
  max-width: 220px;
}

.social-icons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  color: var(--c-branco);
  border: 2px solid var(--c-branco);
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.social-icons a:hover {
  background-color: var(--c-branco);
  transform: translateY(-3px);
}

.social-icons a:hover i {
  color: var(--c-azul-footer);
}

.footer-bottom {
  margin-top: 60px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: var(--c-azul-dark-footer);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 874px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 50px;
  }

  .footer-column p {
    justify-content: center;
    align-items: center;
  }

  .social-icons {
    justify-content: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .tabs {
    flex-direction: column;
  }

  .search-container {
    flex-direction: column;
  }
}

.custom-popsicle-icon {
  width: 40px;
  height: 70px;
  fill: var(--c-rosa);
}

.ituzinho-icon {
  width: 30px;
  height: 80px;
  fill: none;
}

.ituzinho-icon rect {
  fill: #d2b48c;
}

.ituzinho-icon path {
  fill: var(--c-rosa);
}

.skimo-icon {
  width: 40px;
  height: 70px;
}

.skimo-icon .stick {
  fill: #d2b48c;
}

.skimo-icon .inner-ice-cream {
  fill: #ffc0cb;
}

.skimo-icon .chocolate-shell {
  fill: #5d4037;
}

.product-visual .fa-stack {
  font-size: 3.5rem;
  line-height: 1;
}

.product-visual .cone-part {
  color: #dba171;
}

.product-visual .scoop-part {
  color: var(--c-rosa);
  clip-path: inset(0 0 45% 0);
}

.custom-popsicle-icon rect {
  fill: #d2b48c;
}

.custom-popsicle-icon path {
  fill: var(--c-rosa);
}

.custom-popsicle-icon {
  fill: none;
}

.search-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container input,
.search-container .custom-select-container {
  font-family: var(--font-body);
  font-size: 1rem;
  color: #555;
  border: 2px solid #eee;
  border-radius: 8px;
  background-color: var(--c-branco);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

#searchInput {
  padding: 0.75rem;
  flex-grow: 3;
  min-width: 250px;
}

#searchInput:focus {
  outline: none;
  border-color: var(--c-azul);
  box-shadow: 0 0 0 3px rgba(25, 197, 203, 0.2);
}

.custom-select-container {
  flex-grow: 1;
  min-width: 220px;
}

.custom-select-wrapper select {
  display: none;
}

.custom-select-container {
  position: relative;
  cursor: pointer;
}

.custom-select-trigger {
  padding: 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-select-trigger::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #888;
  transition: transform 0.3s ease;
}

.custom-select-container.open .custom-select-trigger::after {
  transform: rotate(180deg);
}

.custom-options {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background-color: var(--c-branco);
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
}

.custom-select-container.open .custom-options {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.custom-option {
  padding: 0.75rem;
  transition: background-color 0.2s ease;
}

.custom-option:hover {
  background-color: rgba(25, 197, 203, 0.1);
}

.custom-option.selected {
  background-color: var(--c-azul);
  color: var(--c-branco);
  font-weight: 600;
}

#scrollToTopBtn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #ff9b2d;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  z-index: 1000;
  text-decoration: none;
}

#scrollToTopBtn.show {
  opacity: 1;
  visibility: visible;
}

.product-card-category {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 15px;
}
</style>