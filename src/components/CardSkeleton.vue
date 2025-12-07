<template>
    <div class="skeleton-card">
        <div class="skeleton-image pulse"></div>
        <div class="skeleton-content">
            <div class="skeleton-title pulse"></div>
            <div class="skeleton-text pulse"></div>
            <div class="skeleton-text short pulse"></div>
            <div class="skeleton-btn pulse"></div>
        </div>
    </div>
</template>

<style scoped>
.skeleton-card {
    height: 420px;
    border-radius: 16px;
    overflow: hidden;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
}

.skeleton-image {
    height: 55%;
    background-color: #e0e0e0;
    width: 100%;
}

.skeleton-content {
    flex-grow: 1;
    padding: 1rem 1.5rem;
    background-color: #fce7f3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.skeleton-title {
    height: 24px;
    width: 70%;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    margin-bottom: 0.5rem;
}

.skeleton-text {
    height: 14px;
    width: 90%;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
}

.skeleton-text.short {
    width: 50%;
    margin-bottom: 1rem;
}

.skeleton-btn {
    height: 40px;
    width: 120px;
    border-radius: 50px;
    background-color: rgba(255, 255, 255, 0.5);
}

.pulse {
    animation: pulse-animation 1.5s infinite ease-in-out;
}

@keyframes pulse-animation {
    0% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.6;
    }
}
</style>