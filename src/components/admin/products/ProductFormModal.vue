<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faCloudUploadAlt, faSave, faLeaf, faPlus, faTrash, faSpinner, faTable, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{
    show: boolean
    product: any | null
    categories: any[]
    loading: boolean
}>()

const emit = defineEmits(['close', 'save'])

interface NutriItem {
    name: string
    value: string
}

const DEFAULT_NUTRI_FIELDS = [
    'Porção',
    'Valor Energético',
    'Carboidratos',
    'Proteínas',
    'Gorduras Totais'
]

const form = ref({
    nome: '',
    descricao: '',
    preco_unitario: '',
    categoriaId: '' as string | number,
    novaCategoria: '',
    isNovaCategoria: false,
    disponivel: true,
    ingredientes: '',
    alergicos: ''
})

const nutritionalItems = ref<NutriItem[]>([])
const formChanged = ref(false)
const showExitConfirmation = ref(false)

const existingImages = ref<any[]>([])
const newFiles = ref<File[]>([])
const newPreviews = ref<string[]>([])
const imagesToDelete = ref<number[]>([])

watch(() => props.show, (newVal) => {
    if (newVal) {
        formChanged.value = false
        showExitConfirmation.value = false
        newFiles.value = []
        newPreviews.value = []
        imagesToDelete.value = []

        if (props.product) {
            const p = props.product
            form.value = {
                nome: p.nome,
                descricao: p.descricao || '',
                preco_unitario: p.preco_unitario,
                categoriaId: p.categoria?.id || (p.categoriaId ? p.categoriaId : ''),
                novaCategoria: '',
                isNovaCategoria: false,
                disponivel: p.disponivel,
                ingredientes: p.ingredientes || '',
                alergicos: p.alergicos || ''
            }

            const infoNutri = p.informacaoNutricional || p.informacao_nutricional || {};
            if (infoNutri && Object.keys(infoNutri).length > 0) {
                nutritionalItems.value = Object.entries(infoNutri).map(([key, value]) => ({
                    name: key,
                    value: String(value)
                }))
            } else {
                loadDefaultNutri()
            }

            existingImages.value = p.imagens ? [...p.imagens] : []

        } else {
            resetForm()
        }
    }
})

watch(form, () => { formChanged.value = true }, { deep: true })
watch(nutritionalItems, () => { formChanged.value = true }, { deep: true })

const loadDefaultNutri = () => {
    nutritionalItems.value = DEFAULT_NUTRI_FIELDS.map(name => ({ name, value: '' }))
}

const resetForm = () => {
    form.value = {
        nome: '', descricao: '', preco_unitario: '', categoriaId: '', novaCategoria: '',
        isNovaCategoria: false, disponivel: true, ingredientes: '', alergicos: ''
    }
    loadDefaultNutri()
    existingImages.value = []
    newFiles.value = []
    newPreviews.value = []
    imagesToDelete.value = []
    formChanged.value = false
}

const handleClose = () => {
    if (formChanged.value && !props.loading) {
        showExitConfirmation.value = true
    } else {
        emit('close')
    }
}

const confirmExit = () => {
    showExitConfirmation.value = false
    emit('close')
}

const cancelExit = () => {
    showExitConfirmation.value = false
}

const addNutriField = () => {
    nutritionalItems.value.push({ name: '', value: '' })
    nextTick(() => {
        const inputs = document.querySelectorAll('.nutri-name');
        (inputs[inputs.length - 1] as HTMLElement)?.focus();
    })
}

const removeNutriField = (index: number) => {
    nutritionalItems.value.splice(index, 1)
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        Array.from(target.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                newFiles.value.push(file)

                const reader = new FileReader()
                reader.onload = (e) => {
                    if (e.target?.result) newPreviews.value.push(e.target.result as string)
                }
                reader.readAsDataURL(file)
            }
        })
        formChanged.value = true
    }
}

const removeExistingImage = (index: number) => {
    const img = existingImages.value[index]
    imagesToDelete.value.push(img.id)
    existingImages.value.splice(index, 1)
    formChanged.value = true
}

const removeNewImage = (index: number) => {
    newFiles.value.splice(index, 1)
    newPreviews.value.splice(index, 1)
    formChanged.value = true
}

const handleSubmit = () => {
    if (props.loading) return

    const nutriObject = nutritionalItems.value.reduce((acc, item) => {
        if (item.name.trim()) acc[item.name] = item.value
        return acc
    }, {} as Record<string, string>)

    const payload = {
        ...form.value,
        nutritionalInfo: nutriObject,
        files: newFiles.value,
        imagesToDelete: imagesToDelete.value
    }
    emit('save', payload)
}
</script>

<template>
    <transition name="modal-fade">
        <div v-if="show" class="modal-backdrop" @click.self="handleClose">
            <div class="modal-container custom-scrollbar">

                <transition name="fade">
                    <div v-if="showExitConfirmation" class="confirm-overlay">
                        <div class="confirm-box">
                            <div class="confirm-icon">
                                <font-awesome-icon :icon="faExclamationTriangle" />
                            </div>
                            <h4>Descartar alterações?</h4>
                            <p>Você tem edições não salvas. Se sair agora, perderá o progresso.</p>
                            <div class="confirm-actions">
                                <button class="btn-keep" @click="cancelExit">Continuar Editando</button>
                                <button class="btn-discard" @click="confirmExit">Descartar e Sair</button>
                            </div>
                        </div>
                    </div>
                </transition>

                <div class="modal-header">
                    <div class="header-text">
                        <h3>{{ product ? 'Editar Produto' : 'Novo Produto' }}</h3>
                        <p>Preencha os detalhes do sorvete abaixo.</p>
                    </div>
                    <button class="close-btn" @click="handleClose" :disabled="loading">
                        <font-awesome-icon :icon="faTimes" />
                    </button>
                </div>

                <div class="modal-body" :class="{ 'blur-loading': loading }">
                    <div class="section-upload">
                        <label class="upload-area">
                            <input type="file" multiple accept="image/*" @change="handleFileUpload" hidden>

                            <div class="upload-placeholder"
                                v-if="existingImages.length === 0 && newPreviews.length === 0">
                                <font-awesome-icon :icon="faCloudUploadAlt" class="upload-icon" />
                                <span>Arraste fotos ou clique para enviar</span>
                            </div>

                            <div class="preview-grid" v-else>
                                <div v-for="(img, idx) in existingImages" :key="'exist-' + img.id" class="preview-item">
                                    <img :src="img.url" />
                                    <button class="remove-img-btn" @click.prevent="removeExistingImage(idx)">
                                        <font-awesome-icon :icon="faTimes" />
                                    </button>
                                </div>
                                <div v-for="(preview, idx) in newPreviews" :key="'new-' + idx"
                                    class="preview-item new-item">
                                    <img :src="preview" />
                                    <div class="new-badge">Novo</div>
                                    <button class="remove-img-btn" @click.prevent="removeNewImage(idx)">
                                        <font-awesome-icon :icon="faTimes" />
                                    </button>
                                </div>
                                <div class="add-more-placeholder">
                                    <font-awesome-icon :icon="faPlus" />
                                </div>
                            </div>
                        </label>
                    </div>

                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Nome do Produto</label>
                            <input type="text" v-model="form.nome" placeholder="Ex: Chocolate Belga" />
                        </div>
                        <div class="form-group">
                            <label>Preço (R$)</label>
                            <input type="number" step="0.01" v-model="form.preco_unitario" placeholder="0.00" />
                        </div>
                        <div class="form-group">
                            <label class="label-flex">
                                Categoria
                                <span class="toggle-link" @click="form.isNovaCategoria = !form.isNovaCategoria">
                                    {{ form.isNovaCategoria ? 'Selecionar existente' : '+ Nova Categoria' }}
                                </span>
                            </label>
                            <input v-if="form.isNovaCategoria" type="text" v-model="form.novaCategoria"
                                placeholder="Nome da nova categoria" class="input-highlight" />
                            <div v-else class="select-wrapper">
                                <select v-model="form.categoriaId">
                                    <option value="" disabled>Selecione...</option>
                                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nome }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label>Descrição</label>
                            <textarea v-model="form.descricao" rows="2" placeholder="Uma breve descrição..."></textarea>
                        </div>
                    </div>

                    <div class="divider">
                        <font-awesome-icon :icon="faLeaf" /> Detalhes & Nutrição
                    </div>

                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label>Ingredientes</label>
                            <textarea v-model="form.ingredientes" rows="2" placeholder="Leite, açúcar..."></textarea>
                        </div>
                        <div class="form-group full-width">
                            <label>Alérgicos</label>
                            <input type="text" v-model="form.alergicos" placeholder="Contém lactose, glúten..." />
                        </div>
                    </div>

                    <div class="nutrition-card">
                        <div class="nutri-title">
                            <font-awesome-icon :icon="faTable" /> Tabela Nutricional
                        </div>
                        <div class="nutri-table">
                            <div class="nutri-header-row">
                                <span class="col-info">Informação</span>
                                <span class="col-qtd">Valor</span>
                                <span class="col-action"></span>
                            </div>
                            <div v-for="(item, index) in nutritionalItems" :key="index" class="nutri-data-row">
                                <div class="input-wrapper">
                                    <input type="text" v-model="item.name" class="nutri-input name"
                                        placeholder="Nome" />
                                </div>
                                <div class="input-wrapper">
                                    <input type="text" v-model="item.value" class="nutri-input value"
                                        placeholder="Valor" />
                                </div>
                                <button class="btn-icon-remove" @click="removeNutriField(index)" title="Remover">
                                    <font-awesome-icon :icon="faTrash" />
                                </button>
                            </div>
                        </div>
                        <button class="btn-add-nutri" @click="addNutriField">
                            <font-awesome-icon :icon="faPlus" /> Adicionar linha
                        </button>
                    </div>

                    <div class="form-footer-options">
                        <label class="switch-container">
                            <input type="checkbox" v-model="form.disponivel" class="hidden-checkbox">
                            <span class="slider round"></span>
                            <span class="switch-label">Produto Disponível para Venda</span>
                        </label>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-cancel" @click="handleClose" :disabled="loading">Cancelar</button>
                    <button class="btn-save" @click="handleSubmit" :disabled="loading" :class="{ 'saving': loading }">
                        <font-awesome-icon :icon="loading ? faSpinner : faSave" :spin="loading" />
                        {{ loading ? 'Salvando...' : (product ? 'Salvar Alterações' : 'Criar Produto') }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.confirm-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: 100;
    /* Fica acima de tudo no modal */
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 24px;
}

.confirm-box {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    text-align: center;
    max-width: 320px;
    border: 1px solid var(--border-light);
    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon {
    font-size: 2rem;
    color: #F59E0B;
    /* Amarelo alerta */
    margin-bottom: 1rem;
}

.confirm-box h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-main);
    font-size: 1.1rem;
}

.confirm-box p {
    margin: 0 0 1.5rem 0;
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.4;
}

.confirm-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.btn-keep {
    font-family: var(--font-title);
    padding: 0.8rem;
    border: none;
    background: var(--primary);
    color: white;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.btn-keep:hover {
    background: var(--primary-dark);
}

.btn-discard {
    font-family: var(--font-title);
    padding: 0.8rem;
    border: 1px solid #fee2e2;
    background: #FEF2F2;
    color: #EF4444;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.btn-discard:hover {
    background: #FEE2E2;
    border-color: #EF4444;
}

@keyframes popIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: var(--bg-card);
    width: 90%;
    max-width: 992px;
    max-height: 90vh;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border-light);
    position: relative;
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    background: #ffffff;
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-text h3 {
    font-size: 1.4rem;
    color: var(--text-main);
    font-weight: 700;
    margin-bottom: 0.2rem;
}

.header-text p {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.2rem;
    cursor: pointer;
    transition: 0.2s;
}

.close-btn:hover {
    color: var(--primary);
    transform: rotate(90deg);
}

.modal-body {
    padding: 2rem;
    transition: opacity 0.3s;
    overflow-y: auto;
    flex: 1;
}

.blur-loading {
    opacity: 0.7;
    pointer-events: none;
    filter: grayscale(0.5);
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
}

.full-width {
    grid-column: span 2;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: 0.3px;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.7rem 1rem;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.95rem;
    background: white;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 4px rgba(255, 94, 142, 0.1);
}

.label-flex {
    display: flex;
    justify-content: space-between;
}

.toggle-link {
    color: var(--primary);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.divider {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin: 2.5rem 0 1.5rem 0;
    color: var(--primary);
    font-weight: 800;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-light);
    opacity: 0.7;
}

.upload-area {
    display: block;
    width: 100%;
    min-height: 140px;
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    margin-bottom: 2rem;
    cursor: pointer;
    background: white;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
}

.upload-area:hover {
    border-color: var(--primary);
    background: #fff0f5;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 140px;
    color: var(--text-muted);
    gap: 0.8rem;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 12px;
    padding: 1rem;
}

.preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.preview-item:hover img {
    transform: scale(1.1);
}

.remove-img-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    backdrop-filter: blur(2px);
}

.add-more-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: var(--text-muted);
    border-radius: 10px;
    aspect-ratio: 1;
    font-size: 1.5rem;
    transition: 0.2s;
}

.add-more-placeholder:hover {
    background: #e2e8f0;
    color: var(--primary);
}

.new-item {
    border: 2px solid #3498db;
    position: relative;
}

.new-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(52, 152, 219, 0.9);
    color: white;
    font-size: 0.7rem;
    text-align: center;
    padding: 2px 0;
    pointer-events: none;
}

.nutrition-card {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border-light);
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
}

.nutri-title {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-light);
    font-weight: 700;
    color: var(--text-main);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.nutri-table {
    padding: 0.5rem;
}

.nutri-header-row {
    display: flex;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    gap: 1rem;
}

.nutri-data-row {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px dashed #f1f5f9;
    gap: 1rem;
}

.col-info,
.input-wrapper:first-child {
    flex: 1;
}

.col-qtd,
.input-wrapper:nth-child(2) {
    width: 35%;
    text-align: right;
}

.col-action,
.btn-icon-remove {
    width: 30px;
    display: flex;
    justify-content: center;
}

.input-wrapper {
    position: relative;
}

.nutri-input {
    font-family: var(--font-title);
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    color: var(--text-main);
    width: 100%;
    background: transparent;
    transition: all 0.2s;
    font-weight: 600;
}

.nutri-input.value {
    text-align: right;
    color: var(--text-muted);
    font-weight: 500;
}

.nutri-input:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
}

.nutri-input:focus {
    background: white;
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 94, 142, 0.1);
}

.nutri-input.name {
    font-weight: 600;
    flex: 1;
}

.nutri-input.value {
    width: 35%;
    text-align: right;
    color: var(--text-muted);
}

.btn-icon-remove {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s;
}

.btn-icon-remove:hover {
    background: #FEF2F2;
    color: #EF4444;
}

.btn-add-nutri {
    width: 100%;
    padding: 0.8rem;
    background: #f8fafc;
    border: none;
    border-top: 1px solid var(--border-light);
    color: var(--primary);
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: 0.2s;
    font-family: var(--font-title);
}

.btn-add-nutri:hover {
    background: #f1f5f9;
    color: var(--primary-dark);
}

.hidden-checkbox {
    display: none;
}

.switch-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    margin-top: 1.5rem;
    padding: 0.5rem;
    border-radius: 12px;
    transition: 0.2s;
}

.switch-container:hover {
    background: white;
}

.switch-label {
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.95rem;
}

.slider {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
    background-color: #cbd5e1;
    border-radius: 30px;
    transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider::before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hidden-checkbox:checked+.slider {
    background-color: var(--primary);
}

.hidden-checkbox:checked+.slider::before {
    transform: translateX(22px);
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    background: #ffffff;
    border-radius: 0 0 24px 24px;
    position: sticky;
    bottom: 0;
}

.btn-cancel {
    padding: 0.75rem 1.5rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 12px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.2s;
    font-family: var(--font-title);
}

.btn-cancel:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: var(--text-main);
}

.btn-save {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 10px rgba(255, 94, 142, 0.3);
    transition: all 0.2s;
    font-family: var(--font-title);
}

.btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
    transform: none !important;
}

.btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(255, 94, 142, 0.4);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-container {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active .modal-container {
    transition: transform 0.2s ease-in;
}

.modal-fade-enter-from .modal-container {
    transform: scale(0.95) translateY(20px);
}

.modal-fade-leave-to .modal-container {
    transform: scale(0.95) translateY(20px);
}

@media (max-width: 992px) {

    .modal-container {
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        border: none;
    }

    .modal-body {
        padding: 1.25rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .full-width {
        grid-column: span 1;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 0.9rem;
        font-size: 1rem;
    }

    .nutri-header-row {
        display: none;
    }

    .nutri-table {
        padding: 0;
        margin-top: 1rem;
    }

    .nutri-data-row {
        flex-direction: column;
        align-items: stretch;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.2rem 1rem 1rem 1rem;
        margin-bottom: 1.2rem;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
        gap: 0.8rem;
        position: relative;
    }

    .nutri-input,
    .nutri-input.value {
        width: 100%;
        text-align: left;
        background: white;
        border: 1px solid #e2e8f0;
        padding: 0.8rem;
        border-radius: 8px;
        color: var(--text-main);
    }

    .col-qtd,
    .input-wrapper:nth-child(2) {
        width: 100%;
    }

    .col-action {
        width: auto;
        position: static;
    }

    .btn-icon-remove {
        position: absolute;
        top: -10px;
        right: -5px;
        background: #EF4444;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        border: 2px solid white;
        opacity: 1;
        z-index: 5;
    }

    .btn-icon-remove:hover {
        background: #DC2626;
    }

    .modal-footer {
        flex-direction: column-reverse;
        gap: 0.8rem;
        padding: 1rem;
    }

    .btn-save,
    .btn-cancel {
        width: 100%;
        justify-content: center;
        padding: 1rem;
        font-size: 1rem;
    }

    .upload-area {
        min-height: 120px;
    }

    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    }
}
</style>