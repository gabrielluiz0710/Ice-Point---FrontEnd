<script setup lang="ts">
import { faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faFacebookF, faInstagram, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

import footerLogoImg from '@/assets/images/logo_full.png';

const contactInfo = [
    { icon: faPhone, text: '(34) 99965-8035', link: 'tel:+5534999658035' },
    { icon: faWhatsapp, text: '(34) 99965-8035', link: 'https://wa.me/5534999658035' },
    { icon: faEnvelope, text: 'icepointuberaba@gmail.com', link: 'mailto:icepointuberaba@gmail.com' },
];

const socialMedia = [
    { icon: faFacebookF, handle: '/IcePointUberaba', link: 'https://facebook.com/IcePointUberaba' },
    { icon: faInstagram, handle: '/icepointuberaba', link: 'https://instagram.com/icepointuberaba' },
    { icon: faTwitter, handle: '/IcePointUberaba', link: 'https://twitter.com/IcePointUberaba' },
    { icon: faLinkedinIn, handle: '/icepointuberaba', link: 'https://linkedin.com/company/icepointuberaba' },
    { icon: faWhatsapp, handle: '(34) 99965-8035', link: 'https://wa.me/5534999658035' },
];

const currentYear = new Date().getFullYear();
</script>

<template>
    <footer class="main-footer">
        <div class="footer-content">
            <div class="footer-section logo-section">
                <RouterLink to="/" class="footer-logo-link" aria-label="Voltar para a página inicial da Ice Point">
                    <img :src="footerLogoImg" alt="Ice Point Sorveteria Logo" class="footer-logo" loading="lazy" />
                </RouterLink>
            </div>

            <div class="footer-section contact-section">
                <h3 class="footer-title">FALE CONOSCO</h3>
                <ul class="contact-list">
                    <li v-for="(item, index) in contactInfo" :key="index" class="contact-item">
                        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="contact-link fade-in-up"
                            :style="{ 'animation-delay': `${0.1 * index}s` }">
                            <font-awesome-icon :icon="item.icon" class="contact-icon" />
                            <span>{{ item.text }}</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="footer-section social-section">
                <h3 class="footer-title">REDES SOCIAIS</h3>
                <ul class="social-list">
                    <li v-for="(item, index) in socialMedia" :key="index" class="social-item">
                        <a :href="item.link" target="_blank" rel="noopener noreferrer" class="social-link fade-in-up"
                            :style="{ 'animation-delay': `${0.1 * (index + contactInfo.length)}s` }">
                            <font-awesome-icon :icon="item.icon" class="social-icon" />
                            <span>{{ item.handle }}</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="footer-section about-section">
                <h3 class="footer-title">CONHEÇA A ICE POINT</h3>
                <p class="about-text">
                    O lugar onde a diversão e a doçura se encontram. Explore nossa seleção de sobremesas geladas e
                    desfrute de momentos de felicidade pura em cada visita!
                </p>
                <div class="footer-social-icons">
                    <a href="https://facebook.com/IcePointUberaba" target="_blank" rel="noopener noreferrer"
                        aria-label="Facebook Ice Point" class="icon-circle pop-in">
                        <font-awesome-icon :icon="faFacebookF" />
                    </a>
                    <a href="https://instagram.com/icepointuberaba" target="_blank" rel="noopener noreferrer"
                        aria-label="Instagram Ice Point" class="icon-circle pop-in" style="animation-delay: 0.1s;">
                        <font-awesome-icon :icon="faInstagram" />
                    </a>
                    <a href="https://twitter.com/IcePointUberaba" target="_blank" rel="noopener noreferrer"
                        aria-label="Twitter Ice Point" class="icon-circle pop-in" style="animation-delay: 0.2s;">
                        <font-awesome-icon :icon="faTwitter" />
                    </a>
                    <a href="https://linkedin.com/company/icepointuberaba" target="_blank" rel="noopener noreferrer"
                        aria-label="LinkedIn Ice Point" class="icon-circle pop-in" style="animation-delay: 0.3s;">
                        <font-awesome-icon :icon="faLinkedinIn" />
                    </a>
                    <a href="https://maps.google.com/?q=Ice+Point+Uberaba" target="_blank" rel="noopener noreferrer"
                        aria-label="Localização Ice Point" class="icon-circle pop-in" style="animation-delay: 0.4s;">
                        <font-awesome-icon :icon="faMapMarkerAlt" />
                    </a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <nav class="footer-legal-nav">
                <RouterLink to="/politica-privacidade" class="legal-link">Política de Privacidade</RouterLink>
                <span class="nav-separator">•</span>
                <RouterLink to="/exclusao-dados" class="legal-link">Exclusão de Dados</RouterLink>
                <span class="nav-separator">•</span>
                <RouterLink to="/termos" class="legal-link">Termos de Serviço</RouterLink>
            </nav>

            <div class="legal-info">
                <span class="legal-item">
                    <strong>Nome Fantasia:</strong> Sorveteria Ice Point </span>
                <span class="separator">•</span>
                <span class="legal-item">
                    <strong>CNPJ:</strong> 39.256.511/0001-04 </span>
                <span class="separator">•</span>
                <span class="legal-item">
                    <strong>Endereço:</strong> Avenida Padre Eddie Bernardes Silva, 965 - Uberaba/MG
                </span>
            </div>
            <div class="copyright">
                <p>© Copyright {{ currentYear }} Ice Point Sorveteria - Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.main-footer {
    background-color: var(--c-azul-footer);
    color: white;
    font-family: 'Fredoka', sans-serif;
    padding-top: 4rem;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.footer-content {
    display: grid;
    grid-template-columns: auto auto auto auto;
    gap: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 3rem;
    align-items: start;
}

.footer-section {
    padding: 1rem 0;
}

.footer-logo-link {
    display: inline-block;
    transition: transform 0.3s ease;
}

.footer-logo-link:hover {
    transform: scale(1.05);
}

.footer-logo {
    max-width: 90%;
    min-width: 180px;
    height: auto;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.footer-title {
    font-family: 'Fredoka', sans-serif;
    font-weight: 700;
    font-size: 1.4rem;
    margin-bottom: 1.5rem;
    position: relative;
    letter-spacing: 0.05em;
}

.footer-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 3px;
    background-color: #ffffff;
    border-radius: 2px;
}

.contact-list,
.social-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.contact-item,
.social-item {
    margin-bottom: 0.8rem;
}

.contact-link,
.social-link {
    color: white;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1rem;
    position: relative;
    padding-bottom: 4px;
    transition: color 0.3s ease;
}

.contact-link span,
.social-link span {
    transition: all 0.3s ease;
}

.contact-link::after,
.social-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ffffff, #eaeaea);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}


.contact-link:hover::after,
.social-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

.contact-link:hover .contact-icon,
.social-link:hover .social-icon {
    transform: rotate(-5deg) scale(1.3);
    color: var(--c-branco);
}

.contact-link:hover span,
.social-link:hover span {
    color: white;
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.7),
        0 0 10px #ffffff,
        0 0 15px rgb(214, 214, 214);
}

.contact-icon,
.social-icon {
    font-size: 1.2rem;
    min-width: 20px;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease;
}

.about-text {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    opacity: 0.9;
}

.footer-social-icons {
    display: flex;
    gap: 0.8rem;
    margin-top: 1.5rem;
}

.icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: white;
    border: white 1px solid;
}

.icon-circle:hover {
    background-color: #ef4b81;
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.footer-bottom {
    background-color: var(--c-azul-dark-footer);
    padding: 2.5rem 2rem 1.5rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.footer-legal-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.legal-link {
    color: #ffffff;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    position: relative;
    padding-bottom: 4px;
    opacity: 0.9;
    transition: opacity 0.3s ease;
    letter-spacing: 0.03em;
}

.legal-link:hover {
    opacity: 1;
}

.legal-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ffffff, #e1e1e1);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.legal-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

.nav-separator {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
}

.legal-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 0.5rem 1rem;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.02em;
}

.legal-item strong {
    color: #ffffff;
    font-weight: 600;
}

.separator {
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.2rem;
    line-height: 0;
}

.copyright p {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.5);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.fade-in-up {
    opacity: 0;
    animation: fadeInUp 0.5s ease-out forwards;
}

.pop-in {
    opacity: 0;
    animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

@media (max-width: 992px) {
    .footer-content {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        padding: 0 1.5rem 2.5rem;
    }

    .logo-section {
        grid-column: span 2;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 2rem;
        margin-bottom: 1rem;
    }

    .footer-title::after {
        left: 50%;
        transform: translateX(-50%);
    }

    .about-section {
        grid-column: span 2;
    }

    .contact-section,
    .social-section,
    .about-section {
        text-align: center;
    }

    .contact-link,
    .social-link {
        justify-content: center;
    }

    .footer-social-icons {
        justify-content: center;
    }
}

@media (max-width: 576px) {
    .main-footer {
        padding-top: 3rem;
    }

    .footer-content {
        grid-template-columns: 1fr;
        gap: 1.8rem;
        padding: 0 1rem 2rem;
    }

    .logo-section {
        grid-column: span 1;
        padding-bottom: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .footer-title {
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }

    .footer-title::after {
        bottom: -6px;
        width: 30px;
    }

    .about-text {
        font-size: 0.95rem;
    }

    .contact-link,
    .social-link {
        font-size: 0.95rem;
    }

    .footer-social-icons {
        flex-wrap: wrap;
        justify-content: center;
    }

    .footer-legal-nav {
        flex-direction: column;
        gap: 0.8rem;
        margin-bottom: 2rem;
    }

    .nav-separator {
        display: none;
    }

    .legal-link {
        font-size: 1rem;
    }

    .legal-info {
        flex-direction: column;
        gap: 0.5rem;
    }

    .separator {
        display: none;
    }

    .footer-bottom {
        padding: 1.5rem 1rem;
    }

    .about-section {
        grid-column: span 1;
    }
}
</style>