class Tour {
    constructor() {
        this.overlay = document.getElementById('tourOverlay');
        this.highlight = document.getElementById('tourHighlight');
        this.tooltip = document.getElementById('tourTooltip');
        this.title = document.getElementById('tourTitle');
        this.description = document.getElementById('tourDescription');
        this.stepCounter = document.getElementById('tourStepCounter');
        this.progressBar = document.getElementById('tourProgressBar');
        this.btnPrev = document.getElementById('tourPrev');
        this.btnNext = document.getElementById('tourNext');
        this.btnSkip = document.getElementById('tourSkip');
        this.btnClose = document.getElementById('tourClose');
        this.dontShowCheckbox = document.getElementById('tourDontShow');

        this.currentStep = 0;
        this.isActive = false;
        this.resizeTimer = null;

        this.steps = [
            { target: '.file-btn', title: '📁 Файл', description: 'Кнопка "Файл" открывает меню сохранения в 12 форматах. Аналог вкладки Файл в Word.', position: 'bottom' },
            { target: '.quick-access', title: '⚡ Быстрый доступ', description: 'Кнопки быстрого доступа: сохранение, отмена и повтор действий. Всегда под рукой.', position: 'bottom' },
            { target: '[data-tab="home"]', title: '🏠 Главная', description: 'Основная вкладка с инструментами форматирования: шрифт, абзац, стили, буфер обмена.', position: 'bottom' },
            { target: '[data-tab="insert"]', title: '➕ Вставка', description: 'Таблицы, изображения, ссылки, колонтитулы и символы.', position: 'bottom' },
            { target: '[data-tab="layout"]', title: '📐 Разметка', description: 'Поля, ориентация, размер страницы и фон.', position: 'bottom' },
            { target: '[data-tab="review"]', title: '📝 Рецензирование', description: 'Проверка орфографии, примечания, отслеживание изменений и сравнение версий.', position: 'bottom' },
            { target: '.page', title: '📄 Страница', description: 'Рабочая область в формате A4. Сверху и снизу — колонтитулы.', position: 'right' },
            { target: '.ruler', title: '📏 Линейка', description: 'Помогает точно позиционировать элементы и настраивать отступы.', position: 'bottom' },
            { target: '.statusbar', title: '📊 Статус', description: 'Внизу: количество слов, страниц, режим просмотра и масштаб.', position: 'top' },
            { target: null, title: '🎉 Готово!', description: 'Вы узнали все возможности редактора. Приятной работы!', position: 'center', final: true }
        ];

        this.bindEvents();
    }

    bindEvents() {
        this.btnNext.addEventListener('click', () => this.next());
        this.btnPrev.addEventListener('click', () => this.prev());
        this.btnSkip.addEventListener('click', () => this.end());
        this.btnClose.addEventListener('click', () => this.end());

        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.updatePosition(), 100);
        });
    }

    start() {
        this.currentStep = 0;
        this.isActive = true;
        this.overlay.classList.add('active');
        this.showStep();
    }

    end() {
        if (this.dontShowCheckbox?.checked) {
            localStorage.setItem('pieEditor_tour_disabled', 'true');
        }
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.highlight.style.display = 'none';
        clearTimeout(this.resizeTimer);
        if (this.dontShowCheckbox) this.dontShowCheckbox.checked = false;
    }

    next() {
        if (this.currentStep < this.steps.length - 1) { this.currentStep++; this.showStep(); }
        else this.end();
    }

    prev() {
        if (this.currentStep > 0) { this.currentStep--; this.showStep(); }
    }

    showStep() {
        const step = this.steps[this.currentStep];
        this.title.textContent = step.title;
        this.description.textContent = step.description;
        this.stepCounter.textContent = `${this.currentStep + 1} из ${this.steps.length}`;
        this.progressBar.style.width = `${((this.currentStep + 1) / this.steps.length) * 100}%`;

        this.btnPrev.disabled = this.currentStep === 0;
        this.btnNext.textContent = this.currentStep === this.steps.length - 1 ? '🎉 Начать!' : 'Далее →';
        this.btnSkip.style.display = this.currentStep === this.steps.length - 1 ? 'none' : 'inline-flex';

        if (step.final) {
            this.tooltip.classList.add('final');
            this.highlight.style.display = 'none';
            this.positionTooltip(null, 'center');
        } else {
            this.tooltip.classList.remove('final');
            this.highlightElement(step.target);
        }
        requestAnimationFrame(() => this.updatePosition());
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) { this.highlight.style.display = 'none'; return; }
        const rect = element.getBoundingClientRect();
        const padding = 8;
        this.highlight.style.display = 'block';
        this.highlight.style.width = `${rect.width + padding * 2}px`;
        this.highlight.style.height = `${rect.height + padding * 2}px`;
        this.highlight.style.left = `${rect.left - padding}px`;
        this.highlight.style.top = `${rect.top - padding}px`;
    }

    updatePosition() {
        const step = this.steps[this.currentStep];
        if (step.final) { this.positionTooltip(null, 'center'); return; }
        const element = document.querySelector(step.target);
        if (!element) { this.highlight.style.display = 'none'; return; }
        this.highlightElement(step.target);
        this.positionTooltip(element, step.position);
    }

    positionTooltip(element, position) {
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const padding = 16, gap = 12;
        let left, top;
        if (position === 'center' || !element) {
            left = (window.innerWidth - tooltipRect.width) / 2;
            top = (window.innerHeight - tooltipRect.height) / 2;
        } else {
            const rect = element.getBoundingClientRect();
            switch (position) {
                case 'bottom': left = rect.left + rect.width / 2 - tooltipRect.width / 2; top = rect.bottom + gap; break;
                case 'top': left = rect.left + rect.width / 2 - tooltipRect.width / 2; top = rect.top - tooltipRect.height - gap; break;
                case 'right': left = rect.right + gap; top = rect.top + rect.height / 2 - tooltipRect.height / 2; break;
                case 'left': left = rect.left - tooltipRect.width - gap; top = rect.top + rect.height / 2 - tooltipRect.height / 2; break;
            }
        }
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }
}

class PieEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.docTitle = document.getElementById('docTitle');
        this.statusText = document.getElementById('statusText');
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        this.pageCount = document.getElementById('pageCount');
        this.saveModal = document.getElementById('saveModal');
        this.fileInput = document.getElementById('fileInput');
        this.imageInput = document.getElementById('imageInput');
        this.zoomValue = document.getElementById('zoomValue');
        this.zoomSlider = document.getElementById('zoomSlider');
        this.currentZoom = 100;
        this.isDirty = false;
        this.autoSaveTimer = null;
        this.currentFormat = 'html';
        this.comments = [];
        this.trackingEnabled = false;
        this.tour = new Tour();

        this.formatInfo = {
            html: { title: 'HTML', desc: 'Веб-страница со встроенными стилями. Открывается в любом браузере.' },
            docx: { title: 'Word (.docx)', desc: 'Современный формат Microsoft Word с полным сохранением форматирования.' },
            doc: { title: 'Word (.doc)', desc: 'Классический формат Word. Совместим со старыми версиями Office.' },
            pdf: { title: 'PDF', desc: 'Универсальный формат для печати и обмена. Выглядит одинаково везде.' },
            txt: { title: 'TXT (UTF-8)', desc: 'Чистый текст с BOM-маркером для корректного отображения кириллицы.' },
            rtf: { title: 'RTF', desc: 'Rich Text Format — универсальный формат с базовым форматированием.' },
            md: { title: 'Markdown', desc: 'Идеально для GitHub, документации и блогов.' },
            odt: { title: 'ODT', desc: 'OpenDocument Text для LibreOffice и OpenOffice.' },
            json: { title: 'JSON', desc: 'Полный бэкап документа со всей структурой.' },
            csv: { title: 'CSV', desc: 'Экспорт всех таблиц из документа для Excel.' },
            print: { title: 'Печать', desc: 'Прямая печать через браузер. Можно сохранить как PDF.' },
            version: { title: 'Сохранить в историю', desc: 'Сохраните текущую версию в истории.' }
        };

        this.init();
    }

    init() {
        this.loadTheme();
        this.bindRibbonTabs();
        this.bindFileMenu();
        this.bindToolbar();
        this.bindEvents();
        this.bindDragDrop();
        this.bindStatusBar();
        this.loadFromStorage();
        this.updateCounts();
        this.updateToolbarState();

        document.getElementById('btnHelp').addEventListener('click', () => this.tour.start());
        if (!localStorage.getItem('pieEditor_tour_disabled')) {
            setTimeout(() => this.tour.start(), 800);
        }
    }

    loadTheme() {
        const theme = localStorage.getItem('pieEditor_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('pieEditor_theme', next);
    }

    bindRibbonTabs() {
        document.querySelectorAll('.ribbon-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ribbon-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
    }

    bindFileMenu() {
        document.getElementById('fileBtn').addEventListener('click', () => {
            this.saveModal.classList.add('active');
            this.selectFormat('html');
        });

        document.getElementById('closeSaveModal').addEventListener('click', () => this.saveModal.classList.remove('active'));
        this.saveModal.addEventListener('click', (e) => { if (e.target === this.saveModal) this.saveModal.classList.remove('active'); });

        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.addEventListener('click', () => this.selectFormat(tab.dataset.format));
        });

        document.getElementById('fileSaveBtn').addEventListener('click', () => this.saveCurrentFormat());
        
        document.getElementById('qaSave').addEventListener('click', () => {
            this.saveModal.classList.add('active');
            this.selectFormat('html');
        });
        document.getElementById('qaUndo').addEventListener('click', () => this.execCommand('undo'));
        document.getElementById('qaRedo').addEventListener('click', () => this.execCommand('redo'));
    }

    selectFormat(format) {
        this.currentFormat = format;
        document.querySelectorAll('.file-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-format="${format}"]`).classList.add('active');
        const info = this.formatInfo[format];
        document.getElementById('filePreviewTitle').textContent = info.title;
        document.getElementById('filePreviewDesc').textContent = info.desc;
    }

    saveCurrentFormat() {
        const fn = {
            html: () => this.saveAsHTML(),
            docx: () => this.saveAsDOCX(),
            doc: () => this.saveAsDOC(),
            pdf: () => this.saveAsPDF(),
            txt: () => this.saveAsTXT(),
            rtf: () => this.saveAsRTF(),
            md: () => this.saveAsMarkdown(),
            odt: () => this.saveAsODT(),
            json: () => this.saveAsJSON(),
            csv: () => this.saveAsCSV(),
            print: () => this.printDocument(),
            version: () => this.saveVersion()
        };
        if (fn[this.currentFormat]) fn[this.currentFormat]();
    }

    bindToolbar() {
        document.querySelectorAll('.ribbon-btn[data-cmd]').forEach(btn => {
            btn.addEventListener('mousedown', (e) => e.preventDefault());
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                if (cmd === 'createLink') {
                    const url = prompt('URL:', 'https://');
                    if (url) this.execCommand('createLink', url);
                } else {
                    this.execCommand(cmd, btn.dataset.value || null);
                }
            });
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => this.execCommand('fontName', e.target.value));
        document.getElementById('fontSize').addEventListener('change', (e) => this.execCommand('fontSize', e.target.value));
        document.getElementById('formatBlock').addEventListener('change', (e) => this.execCommand('formatBlock', `<${e.target.value}>`));
        document.getElementById('textColor').addEventListener('input', (e) => {
            document.getElementById('fgBar').style.background = e.target.value;
            this.execCommand('foreColor', e.target.value);
        });
        document.getElementById('bgColor').addEventListener('input', (e) => {
            document.getElementById('bgBar').style.background = e.target.value;
            this.execCommand('hiliteColor', e.target.value);
        });

        document.getElementById('btnInsertImage').addEventListener('click', () => this.imageInput.click());
        document.getElementById('btnInsertTable').addEventListener('click', () => this.insertTable());
        document.getElementById('btnInsertHR').addEventListener('click', () => this.execCommand('insertHTML', '<hr>'));
        document.getElementById('btnPageBreak').addEventListener('click', () => this.execCommand('insertHTML', '<div style="page-break-after:always;border-top:2px dashed #999;margin:20px 0"></div>'));
        document.getElementById('btnTOC').addEventListener('click', () => this.showTOC());

        document.getElementById('btnOrientation').addEventListener('click', () => {
            const page = document.querySelector('.page');
            const current = page.style.getPropertyValue('--orientation') || 'portrait';
            if (current === 'portrait') {
                page.style.maxWidth = '1056px';
                page.style.minHeight = '816px';
                page.style.setProperty('--orientation', 'landscape');
            } else {
                page.style.maxWidth = '816px';
                page.style.minHeight = '1056px';
                page.style.setProperty('--orientation', 'portrait');
            }
        });

        document.getElementById('btnWatermark').addEventListener('click', () => {
            const text = prompt('Текст водяного знака:', 'ЧЕРНОВИК');
            if (text) {
                let wm = document.getElementById('watermark');
                if (!wm) {
                    wm = document.createElement('div');
                    wm.id = 'watermark';
                    wm.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:80pt;color:rgba(0,0,0,0.1);pointer-events:none;z-index:0;font-weight:bold;white-space:nowrap';
                    this.editor.appendChild(wm);
                }
                wm.textContent = text;
            }
        });

        document.getElementById('btnNewComment').addEventListener('click', () => this.addComment());
        document.getElementById('btnTrackChanges').addEventListener('click', () => {
            this.trackingEnabled = !this.trackingEnabled;
            document.getElementById('btnTrackChanges').classList.toggle('active', this.trackingEnabled);
            alert(this.trackingEnabled ? 'Отслеживание включено' : 'Отслеживание выключено');
        });
        document.getElementById('btnWordCount').addEventListener('click', () => {
            const text = this.editor.innerText.trim();
            const words = text ? text.split(/\s+/).length : 0;
            const chars = text.length;
            const paragraphs = text ? text.split(/\n\n+/).length : 0;
            alert(`Слов: ${words}\nСимволов: ${chars}\nАбзацев: ${paragraphs}\nВремя чтения: ${Math.ceil(words / 200)} мин`);
        });
        document.getElementById('btnCompare').addEventListener('click', () => {
            alert('Функция сравнения документов. В полной версии можно будет загрузить второй файл.');
        });

        document.getElementById('btnFocus').addEventListener('click', () => document.body.classList.toggle('focus-mode'));
        document.getElementById('btnFullscreen').addEventListener('click', () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        });
        document.getElementById('showRuler').addEventListener('change', (e) => {
            document.getElementById('ruler').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('btnSearch').addEventListener('click', () => {
            document.getElementById('searchModal').classList.add('active');
            document.getElementById('searchInput').focus();
        });
        document.getElementById('btnReplace').addEventListener('click', () => {
            document.getElementById('searchModal').classList.add('active');
            document.getElementById('searchInput').focus();
        });
        document.getElementById('closeSearchModal').addEventListener('click', () => document.getElementById('searchModal').classList.remove('active'));
        document.getElementById('searchModal').addEventListener('click', (e) => { if (e.target.id === 'searchModal') e.currentTarget.classList.remove('active'); });
        document.getElementById('searchNext').addEventListener('click', () => this.findNext());
        document.getElementById('searchPrev').addEventListener('click', () => this.findPrev());
        document.getElementById('replaceBtn').addEventListener('click', () => this.replaceText());
        document.getElementById('replaceAllBtn').addEventListener('click', () => this.replaceAll());

        document.getElementById('btnVersions').addEventListener('click', () => this.showVersions());
        document.getElementById('closeVersionModal').addEventListener('click', () => document.getElementById('versionModal').classList.remove('active'));
        document.getElementById('versionModal').addEventListener('click', (e) => { if (e.target.id === 'versionModal') e.currentTarget.classList.remove('active'); });
        document.getElementById('clearVersions').addEventListener('click', () => {
            if (confirm('Очистить историю версий?')) {
                localStorage.removeItem('pieEditor_versions');
                this.showVersions();
            }
        });

        document.getElementById('btnZoomIn').addEventListener('click', () => this.setZoom(this.currentZoom + 10));
        document.getElementById('btnZoomOut').addEventListener('click', () => this.setZoom(this.currentZoom - 10));
        document.getElementById('zoom100').addEventListener('click', () => this.setZoom(100));
        document.getElementById('zoomSlider').addEventListener('input', (e) => this.setZoom(parseInt(e.target.value)));
        document.getElementById('zoomIn').addEventListener('click', () => this.setZoom(this.currentZoom + 10));
        document.getElementById('zoomOut').addEventListener('click', () => this.setZoom(this.currentZoom - 10));

        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        document.getElementById('btnLineSpacing').addEventListener('click', () => {
            const spacing = prompt('Межстрочный интервал (1, 1.15, 1.5, 2, 2.5, 3):', '1.15');
            if (spacing) {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('insertHTML', false, `<span style="line-height:${spacing}">${window.getSelection().toString() || 'текст'}</span>`);
            }
        });

        document.getElementById('btnSymbol').addEventListener('click', () => {
            const symbol = prompt('Введите символ:', '©');
            if (symbol) this.execCommand('insertHTML', symbol);
        });
        document.getElementById('btnEquation').addEventListener('click', () => {
            const eq = prompt('Уравнение:', 'x² + y² = z²');
            if (eq) this.execCommand('insertHTML', `<span style="font-family:serif;font-style:italic">${eq}</span>`);
        });
    }

    setZoom(value) {
        this.currentZoom = Math.max(50, Math.min(200, value));
        this.editor.style.transform = `scale(${this.currentZoom / 100})`;
        this.editor.style.transformOrigin = 'top center';
        this.zoomValue.textContent = `${this.currentZoom}%`;
        this.zoomSlider.value = this.currentZoom;
    }

    execCommand(cmd, value = null) {
        document.execCommand(cmd, false, value);
        this.editor.focus();
        this.markDirty();
        this.updateToolbarState();
    }

    updateToolbarState() {
        document.querySelectorAll('.ribbon-btn[data-cmd]').forEach(btn => {
            const cmd = btn.dataset.cmd;
            try {
                btn.classList.toggle('active', document.queryCommandState(cmd));
            } catch(e) {}
        });
    }

    bindEvents() {
        this.editor.addEventListener('input', () => { this.markDirty(); this.updateCounts(); this.scheduleAutoSave(); });
        this.editor.addEventListener('mouseup', () => this.updateToolbarState());
        this.editor.addEventListener('keyup', () => this.updateToolbarState());
        this.fileInput.addEventListener('change', (e) => this.handleFileOpen(e));
        this.imageInput.addEventListener('change', (e) => this.handleImageInsert(e));
        this.docTitle.addEventListener('input', () => this.markDirty());
        window.addEventListener('beforeunload', (e) => { if (this.isDirty) { e.preventDefault(); e.returnValue = ''; } });
    }

    bindDragDrop() {
        const dropZone = document.getElementById('dropZone');
        document.addEventListener('dragenter', (e) => { e.preventDefault(); if (e.dataTransfer.types.includes('Files')) dropZone.classList.add('active'); });
        dropZone.addEventListener('dragleave', (e) => { if (e.target === dropZone) dropZone.classList.remove('active'); });
        dropZone.addEventListener('dragover', (e) => e.preventDefault());
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); dropZone.classList.remove('active');
            for (let file of e.dataTransfer.files) { if (file.type.startsWith('image/')) this.handleImageFile(file); }
        });
    }

    bindStatusBar() {
        document.getElementById('viewPrint')?.addEventListener('click', () => this.setView('print'));
        document.getElementById('viewRead')?.addEventListener('click', () => this.setView('read'));
        document.getElementById('viewWeb')?.addEventListener('click', () => this.setView('web'));
    }

    setView(mode) {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`view${mode.charAt(0).toUpperCase() + mode.slice(1)}`)?.classList.add('active');
        if (mode === 'read') {
            this.editor.style.padding = '40px';
            this.editor.style.maxWidth = '600px';
        } else if (mode === 'web') {
            this.editor.style.padding = '40px';
            this.editor.style.maxWidth = 'none';
        } else {
            this.editor.style.padding = '72px 80px';
            this.editor.style.maxWidth = '816px';
        }
    }

    handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => this.execCommand('insertHTML', `<img src="${e.target.result}" alt="image" style="max-width:100%">`);
        reader.readAsDataURL(file);
    }

    handleFileOpen(e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (file.name.endsWith('.txt')) {
                this.editor.innerText = event.target.result;
            } else {
                const doc = new DOMParser().parseFromString(event.target.result, 'text/html');
                this.editor.innerHTML = doc.body.innerHTML || event.target.result;
            }
            this.docTitle.value = file.name.replace(/\.[^.]+$/, '');
            this.markDirty(); this.saveToStorage();
        };
        reader.readAsText(file); this.fileInput.value = '';
    }

    handleImageInsert(e) { if (e.target.files[0]) this.handleImageFile(e.target.files[0]); this.imageInput.value = ''; }

    insertTable() {
        const rows = parseInt(prompt('Строки:', '3'));
        const cols = parseInt(prompt('Столбцы:', '3'));
        if (!rows || !cols) return;
        let table = '<table>';
        for (let i = 0; i < rows; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) table += i === 0 ? '<th>&nbsp;</th>' : '<td>&nbsp;</td>';
            table += '</tr>';
        }
        table += '</table><p><br></p>';
        this.execCommand('insertHTML', table);
    }

    addComment() {
        const text = prompt('Комментарий:');
        if (!text) return;
        const id = 'c' + Date.now();
        this.execCommand('insertHTML', `<span class="comment" data-id="${id}" style="background:#fff3cd;border-bottom:2px solid #ffc107;cursor:pointer" title="${text}">${window.getSelection().toString() || '⚠'}</span>`);
        this.comments.push({ id, text });
    }

    findNext() { const s = document.getElementById('searchInput').value; if (s) window.find(s, false, false, true); }
    findPrev() { const s = document.getElementById('searchInput').value; if (s) window.find(s, false, true, true); }
    replaceText() {
        const s = document.getElementById('searchInput').value, r = document.getElementById('replaceInput').value;
        if (s && window.find(s)) { document.execCommand('insertText', false, r); this.markDirty(); }
    }
    replaceAll() {
        const s = document.getElementById('searchInput').value, r = document.getElementById('replaceInput').value;
        if (!s) return;
        const caseS = document.getElementById('searchCase').checked, whole = document.getElementById('searchWhole').checked;
        let regex = new RegExp(whole ? `\\b${s}\\b` : s, caseS ? 'g' : 'gi');
        this.editor.innerHTML = this.editor.innerHTML.replace(regex, r);
        this.markDirty();
    }

    showTOC() {
        const headings = this.editor.querySelectorAll('h1, h2, h3, h4');
        const tocList = document.getElementById('tocList'); tocList.innerHTML = '';
        if (headings.length === 0) {
            tocList.innerHTML = '<p style="text-align:center;color:var(--text-muted)">Заголовки не найдены</p>';
        } else {
            headings.forEach(h => {
                const li = document.createElement('li');
                li.className = `toc-item toc-item-${h.tagName.toLowerCase()}`;
                li.textContent = h.textContent;
                li.onclick = () => { h.scrollIntoView({ behavior: 'smooth' }); document.getElementById('tocModal').classList.remove('active'); };
                tocList.appendChild(li);
            });
        }
        document.getElementById('tocModal').classList.add('active');
    }

    saveVersion() {
        const versions = JSON.parse(localStorage.getItem('pieEditor_versions') || '[]');
        versions.unshift({ id: Date.now(), title: this.docTitle.value, content: this.editor.innerHTML, date: new Date().toISOString() });
        if (versions.length > 10) versions.pop();
        localStorage.setItem('pieEditor_versions', JSON.stringify(versions));
        this.saveModal.classList.remove('active'); alert('Версия сохранена!');
    }

    showVersions() {
        const versions = JSON.parse(localStorage.getItem('pieEditor_versions') || '[]');
        const list = document.getElementById('versionList'); list.innerHTML = '';
        if (!versions.length) list.innerHTML = '<p style="text-align:center;color:var(--text-muted)">История пуста</p>';
        else versions.forEach(v => {
            const item = document.createElement('div'); item.className = 'version-item';
            item.innerHTML = `<div><div class="version-title">${v.title}</div><div class="version-date">${new Date(v.date).toLocaleString('ru-RU')}</div></div><div><button class="version-btn" onclick="app.restoreVersion(${v.id})">Восстановить</button> <button class="version-btn" onclick="app.deleteVersion(${v.id})">Удалить</button></div>`;
            list.appendChild(item);
        });
        document.getElementById('versionModal').classList.add('active');
    }

    restoreVersion(id) {
        if (!confirm('Восстановить эту версию?')) return;
        const v = JSON.parse(localStorage.getItem('pieEditor_versions') || '[]').find(x => x.id === id);
        if (v) { this.editor.innerHTML = v.content; this.docTitle.value = v.title; this.markDirty(); this.saveToStorage(); document.getElementById('versionModal').classList.remove('active'); }
    }

    deleteVersion(id) {
        if (!confirm('Удалить версию?')) return;
        localStorage.setItem('pieEditor_versions', JSON.stringify(JSON.parse(localStorage.getItem('pieEditor_versions') || '[]').filter(v => v.id !== id)));
        this.showVersions();
    }

    // === EXPORTS ===
    saveAsHTML() {
        const t = this.docTitle.value || 'document';
        const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>${t}</title><style>body{font-family:Inter,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.7}h1{font-size:2em;color:#4f46e5}h2{font-size:1.5em;color:#4f46e5}blockquote{border-left:4px solid #4f46e5;padding:12px 20px;background:#eef2ff;font-style:italic}table{border-collapse:collapse}td,th{border:1px solid #e2e8f0;padding:8px 12px}th{background:#eef2ff}img{max-width:100%}</style></head><body>${this.editor.innerHTML}</body></html>`;
        this.downloadFile(`${t}.html`, html, 'text/html'); this.saveModal.classList.remove('active'); this.markClean();
    }

    saveAsDOCX() {
        const t = this.docTitle.value || 'document';
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.15}h1{font-size:24pt;color:#4f46e5}h2{font-size:16pt;color:#4f46e5}table{border-collapse:collapse}td,th{border:1px solid black;padding:6px}</style></head><body>${this.editor.innerHTML}</body></html>`;
        try {
            const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            saveAs(blob, `${t}.docx`);
            this.saveModal.classList.remove('active'); this.markClean();
        } catch(e) { alert('Ошибка: ' + e.message); }
    }

    saveAsDOC() {
        const t = this.docTitle.value || 'document';
        const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="UTF-8"><title>${t}</title></head><body>${this.editor.innerHTML}</body></html>`;
        this.downloadFile(`${t}.doc`, html, 'application/msword'); this.saveModal.classList.remove('active'); this.markClean();
    }

    async saveAsPDF() {
        const t = this.docTitle.value || 'document';
        this.saveModal.classList.remove('active');
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const canvas = await html2canvas(this.editor, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210, pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight, position = 0;
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            doc.save(`${t}.pdf`); this.markClean();
        } catch(e) { alert('Ошибка PDF: ' + e.message); }
    }

    saveAsTXT() {
        const t = this.docTitle.value || 'document';
        const blob = new Blob(['\uFEFF' + this.editor.innerText], { type: 'text/plain;charset=utf-8' });
        this.downloadFile(`${t}.txt`, blob, 'text/plain'); this.saveModal.classList.remove('active'); this.markClean();
    }

    saveAsRTF() {
        const t = this.docTitle.value || 'document';
        const text = this.editor.innerText.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
        const rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Calibri;}}\\f0\\fs22 ${text}}`;
        this.downloadFile(`${t}.rtf`, rtf, 'application/rtf'); this.saveModal.classList.remove('active'); this.markClean();
    }

    saveAsMarkdown() {
        const t = this.docTitle.value || 'document';
        this.downloadFile(`${t}.md`, this.htmlToMarkdown(this.editor.innerHTML), 'text/markdown');
        this.saveModal.classList.remove('active'); this.markClean();
    }

    async saveAsODT() {
        const t = this.docTitle.value || 'document';
        try {
            const zip = new JSZip();
            zip.file("mimetype", "application/vnd.oasis.opendocument.text");
            const content = `<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2"><office:body><office:text><text:p>${this.editor.innerText}</text:p></office:text></office:body></office:document-content>`;
            zip.file("content.xml", content);
            const manifest = `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/><manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/></manifest:manifest>`;
            zip.folder("META-INF").file("manifest.xml", manifest);
            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, `${t}.odt`);
            this.saveModal.classList.remove('active'); this.markClean();
        } catch(e) { alert('Ошибка ODT: ' + e.message); }
    }

    saveAsJSON() {
        const t = this.docTitle.value || 'document';
        const data = { title: this.docTitle.value, content: this.editor.innerHTML, text: this.editor.innerText, savedAt: new Date().toISOString(), version: '2.0' };
        this.downloadFile(`${t}.json`, JSON.stringify(data, null, 2), 'application/json');
        this.saveModal.classList.remove('active'); this.markClean();
    }

    saveAsCSV() {
        const t = this.docTitle.value || 'document';
        const tables = this.editor.querySelectorAll('table');
        if (tables.length === 0) { alert('Нет таблиц для экспорта'); return; }
        let csv = '';
        tables.forEach((table, i) => {
            if (i > 0) csv += '\n\n';
            csv += `# Таблица ${i + 1}\n`;
            table.querySelectorAll('tr').forEach(row => {
                const cells = Array.from(row.querySelectorAll('th, td')).map(c => '"' + c.innerText.replace(/"/g, '""') + '"');
                csv += cells.join(',') + '\n';
            });
        });
        this.downloadFile(`${t}.csv`, csv, 'text/csv'); this.saveModal.classList.remove('active'); this.markClean();
    }

    htmlToMarkdown(html) {
        let md = html;
        md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n').replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n').replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n').replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
        md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**').replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*').replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');
        md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => c.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n'));
        md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => { let i=1; return c.replace(/<li[^>]*>(.*?)<\/li>/gi, (_, t) => `${i++}. ${t}\n`); });
        md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
        md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n').replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n').replace(/<hr[^>]*\/?>/gi, '---\n\n').replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        return md.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
    }

    printDocument() { this.saveModal.classList.remove('active'); window.print(); }

    downloadFile(filename, content, mimeType) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    saveToStorage() { localStorage.setItem('pieEditor_document', JSON.stringify({ title: this.docTitle.value, content: this.editor.innerHTML, savedAt: new Date().toISOString() })); }
    loadFromStorage() {
        const s = localStorage.getItem('pieEditor_document');
        if (s) { try { const d = JSON.parse(s); this.docTitle.value = d.title || 'Документ1'; this.editor.innerHTML = d.content || this.editor.innerHTML; } catch(e) {} }
    }
    scheduleAutoSave() { clearTimeout(this.autoSaveTimer); this.autoSaveTimer = setTimeout(() => this.saveToStorage(), 3000); }
    markDirty() { this.isDirty = true; this.statusText.textContent = '● Не сохранено'; this.statusText.style.color = '#f59e0b'; }
    markClean() { this.isDirty = false; this.statusText.textContent = '✓ Сохранено'; this.statusText.style.color = ''; this.saveToStorage(); }
    updateCounts() {
        const t = this.editor.innerText.trim(), w = t ? t.split(/\s+/).length : 0, c = t.length;
        this.wordCount.textContent = w; this.charCount.textContent = c;
        this.pageCount.textContent = Math.ceil(w / 250) || 1;
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new PieEditor(); });
