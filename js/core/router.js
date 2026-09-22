/**
 * ENRUTADOR Y GESTOR DE VISTAS (AppRouter)
 * Controla la transición limpia entre las vistas principales:
 * INICIO (Dashboard) | CALENDARIO | EDITOR DE CLASE | SECUENCIAS | CONFIGURACIÓN | CUADERNO
 *
 * Principio: Navegar es una operación de lectura pura. Jamás guarda ni altera datos por el hecho de cambiar de vista.
 */

class AppRouterClass {
  constructor() {
    this.currentView = 'dashboard';
    this.currentOptions = {};
    this.viewContainers = {};
    this.historyStack = [];
    this._historyIndex = 0;
    this._isNavigatingBack = false;
    this._initialized = false;
  }

  _bindContainers() {
    if (typeof document === 'undefined') return;
    this.viewContainers = {
      dashboard: document.getElementById('dashboard-view'),
      calendar: document.getElementById('calendar-view'),
      editor: document.getElementById('class-editor-view'),
      sequences: document.getElementById('sequences-view'),
      history: document.getElementById('history-view'),
      recovery: document.getElementById('recovery-view'),
      notebook: document.getElementById('notebook-view')
    };
  }

  init() {
    this._bindContainers();

    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this.historyStack = [];
    this._historyIndex = 0;
    this._isNavigating = false;

    // Suscribirse a cambios en AppState
    if (typeof AppState !== 'undefined') {
      AppState.subscribe((state, changedKey) => {
        if (changedKey === 'currentView') {
          const canonical = (state.currentView === 'class-editor') ? 'editor' : state.currentView;
          if (canonical !== this.currentView) {
            this.navigateTo(canonical, { bypassStateUpdate: true });
          }
        }
      });
    }

    // Inicializar gestión de historial de navegador (HTML5 History API)
    if (typeof window !== 'undefined') {
      let initialView = this.currentView || 'dashboard';
      let initialOpts = {};

      if (window.location && window.location.hash) {
        const hashClean = window.location.hash.replace(/^#/, '');
        const [viewPart, queryPart] = hashClean.split('?');
        const canonical = (viewPart === 'class-editor') ? 'editor' : viewPart;
        if (this.viewContainers && (this.viewContainers[canonical] || canonical === 'editor')) {
          initialView = canonical;
          if (queryPart) {
            try {
              const params = new URLSearchParams(queryPart);
              if (params.get('id')) initialOpts.classId = params.get('id');
            } catch (e) {}
          }
        }
      }

      this.currentView = initialView;
      this.currentOptions = initialOpts;

      // Estado base inicial en el navegador (replaceState para no crear entrada extra vacía)
      if (window.history && window.history.replaceState) {
        try {
          const hashUrl = '#' + initialView + (initialOpts.classId ? `?id=${encodeURIComponent(initialOpts.classId)}` : '');
          window.history.replaceState({
            view: initialView,
            options: initialOpts,
            historyIndex: 0
          }, '', hashUrl);
        } catch (e) {}
      }

      // Escuchar evento popstate (botón Atrás / Adelante del navegador o hardware)
      window.addEventListener('popstate', (event) => {
        this._handlePopState(event);
      });

      // Renderizar y asegurar visibilidad de la vista inicial sin duplicar entradas
      this._updateContainerVisibility(initialView);
      this._updateNavButtons(initialView);
      this._onViewActivated(initialView, initialOpts);
    }
  }

  _handlePopState(event) {
    // Si la navegación hacia atrás ya fue ejecutada instantáneamente por goBack(), solo sincronizar índice
    if (this._isNavigatingBack) {
      this._isNavigatingBack = false;
      if (event && event.state && typeof event.state.historyIndex === 'number') {
        this._historyIndex = event.state.historyIndex;
      } else if (this._historyIndex > 0) {
        this._historyIndex--;
      }
      return;
    }

    const state = event.state;

    // 1. Verificar cambios sin guardar en el editor actual
    if (typeof AppState !== 'undefined' && AppState.get('isDirty')) {
      const confirmLeave = confirm('Tienes cambios sin guardar en esta clase. ¿Deseas salir sin guardar?');
      if (!confirmLeave) {
        // Canceló: re-empujar el estado actual para que el navegador no desincronice la URL
        try {
          if (window.history && window.history.pushState) {
            const currentHash = '#' + this.currentView + (this.currentOptions?.classId ? `?id=${encodeURIComponent(this.currentOptions.classId)}` : '');
            window.history.pushState({
              view: this.currentView,
              options: this.currentOptions || {},
              historyIndex: this._historyIndex
            }, '', currentHash);
          }
        } catch (e) {}
        return;
      }
      AppState.set('isDirty', false);
    }

    // 2. Determinar destino
    let targetView = 'dashboard';
    let targetOptions = {};
    let targetIndex = 0;

    if (state && state.view) {
      targetView = state.view;
      targetOptions = state.options || {};
      targetIndex = (typeof state.historyIndex === 'number') ? state.historyIndex : 0;
    } else if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const hashClean = window.location.hash.replace(/^#/, '');
      const [viewPart, queryPart] = hashClean.split('?');
      const canonical = (viewPart === 'class-editor') ? 'editor' : viewPart;
      if (this.viewContainers && (this.viewContainers[canonical] || canonical === 'editor')) {
        targetView = canonical;
        if (queryPart) {
          try {
            const params = new URLSearchParams(queryPart);
            if (params.get('id')) targetOptions.classId = params.get('id');
          } catch (e) {}
        }
      }
    }

    // Sincronizar pila interna según si fue hacia atrás o adelante
    if (targetIndex < this._historyIndex) {
      if (this.historyStack.length > 0) {
        this.historyStack.pop();
      }
    }
    this._historyIndex = targetIndex;

    this.navigateTo(targetView, { ...targetOptions, fromPopState: true, bypassDirtyCheck: true });
  }

  _updateContainerVisibility(canonical) {
    if (!this.viewContainers) return;
    Object.keys(this.viewContainers).forEach(vKey => {
      const el = this.viewContainers[vKey];
      if (el) {
        if (vKey === canonical) {
          el.style.display = (vKey === 'calendar') ? 'grid' : 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });

    const legacyPlanner = document.getElementById('planner-view');
    if (legacyPlanner) {
      legacyPlanner.style.display = (canonical === 'editor' && !this.viewContainers.editor) ? 'block' : 'none';
    }

    if (document.body) {
      if (canonical === 'notebook') {
        document.body.classList.add('notebook-mode');
      } else {
        document.body.classList.remove('notebook-mode');
      }
    }
  }

  /**
   * Navega a una vista asegurando que no queden cambios sin guardar sin confirmar
   */
  navigateTo(viewName, options = {}) {
    // force:true siempre pasa (permite re-renderizado post-carga de datos)
    if (this._isNavigating && !options.force) return false;
    this._isNavigating = true;
    try {
      const canonical = (viewName === 'class-editor') ? 'editor' : viewName;
      const isSameView = this.currentView === canonical;
      const isSameClass = !options.classId || options.classId === this.currentOptions?.classId;
      const targetContainer = this.viewContainers[canonical];
      const isContainerEmpty = targetContainer && !targetContainer.innerHTML.trim();

      if (isSameView && isSameClass && !options.force && !isContainerEmpty) return false;

      // Verificar cambios sin guardar en el editor actual
      if (!options.bypassDirtyCheck && typeof AppState !== 'undefined' && AppState.get('isDirty')) {
        const confirmLeave = confirm('Tienes cambios sin guardar en esta clase. ¿Deseas salir sin guardar?');
        if (!confirmLeave) return false;
        AppState.set('isDirty', false);
      }

      const prevView = this.currentView;
      const prevOptions = this.currentOptions || {};

      // Si NO proviene de popstate, gestionar la pila interna y el historial del navegador
      if (!options.fromPopState) {
        // Guardar en la pila interna de navegación histórica
        if (prevView && (prevView !== canonical || (prevOptions.classId && prevOptions.classId !== options.classId))) {
          this.historyStack.push({ view: prevView, options: prevOptions });
          if (this.historyStack.length > 50) this.historyStack.shift();
        }

        // Actualizar historial del navegador con pushState / replaceState
        if (typeof window !== 'undefined' && window.history) {
          try {
            const hashUrl = '#' + canonical + (options.classId ? `?id=${encodeURIComponent(options.classId)}` : '');
            if (options.replace) {
              if (window.history.replaceState) {
                window.history.replaceState({
                  view: canonical,
                  options: { classId: options.classId },
                  historyIndex: this._historyIndex
                }, '', hashUrl);
              }
            } else {
              if (window.history.pushState) {
                this._historyIndex++;
                window.history.pushState({
                  view: canonical,
                  options: { classId: options.classId },
                  historyIndex: this._historyIndex
                }, '', hashUrl);
              }
            }
          } catch (e) {}
        }
      }

      this.currentView = canonical;
      this.currentOptions = options;

      if (!options.bypassStateUpdate && typeof AppState !== 'undefined') {
        AppState.set('currentView', canonical);
      }

      // Actualizar visibilidad de contenedores
      this._updateContainerVisibility(canonical);

      // Actualizar clases activas en la barra de navegación principal
      this._updateNavButtons(canonical);

      // Disparar ganchos específicos por vista
      this._onViewActivated(canonical, options);

      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      return true;
    } finally {
      this._isNavigating = false;
    }
  }

  /**
   * Vuelve a la sección o vista anterior de forma segura e instantánea.
   * Resuelve inmediatamente en memoria la vista previa sin bloqueos ni esperas asíncronas.
   * Si hay historial en el navegador, sincroniza la URL en segundo plano.
   * Jamás saca al usuario de la aplicación.
   */
  goBack() {
    // 1. Verificar cambios sin guardar
    if (typeof AppState !== 'undefined' && AppState.get('isDirty')) {
      const confirmLeave = confirm('Tienes cambios sin guardar en esta clase. ¿Deseas salir sin guardar?');
      if (!confirmLeave) return false;
      AppState.set('isDirty', false);
    }

    // 2. Limpiar/cancelar temporizadores pendientes de la vista saliente y sincronizar cambios inmediatos
    if (typeof ClassService !== 'undefined' && ClassService.cancelPendingAutoSave) {
      ClassService.cancelPendingAutoSave();
    }
    if (typeof NotebookEditor !== 'undefined') {
      if (NotebookEditor._autoSaveTimer) {
        clearTimeout(NotebookEditor._autoSaveTimer);
        NotebookEditor._autoSaveTimer = null;
      }
      if (this.currentView === 'notebook' && typeof NotebookEditor.saveCurrentNotebookContent === 'function') {
        try {
          NotebookEditor.saveCurrentNotebookContent(false);
        } catch (e) {}
      }
    }

    // 3. Determinar destino previo prioritario desde historyStack
    let targetView = 'dashboard';
    let targetOptions = {};

    if (this.historyStack && this.historyStack.length > 0) {
      const prev = this.historyStack.pop();
      targetView = prev.view;
      targetOptions = prev.options || {};
    } else {
      // Fallback contextual si la pila está vacía (evita sacar al usuario o desorientarlo)
      if (this.currentView === 'notebook') {
        targetView = 'editor';
        if (this.currentOptions?.classId) targetOptions.classId = this.currentOptions.classId;
      } else if (this.currentView === 'editor') {
        targetView = 'calendar';
      } else {
        targetView = 'dashboard';
      }
    }

    // 4. Si el navegador tiene historial empujado en la SPA, sincronizarlo sin retrasar la interfaz
    if (this._historyIndex > 0 && typeof window !== 'undefined' && window.history && typeof window.history.back === 'function') {
      this._isNavigatingBack = true;
      try {
        window.history.back();
      } catch (e) {
        this._isNavigatingBack = false;
      }
    }

    // 5. Transición inmediata e instantánea (0 ms) a la vista anterior
    return this.navigateTo(targetView, { ...targetOptions, bypassDirtyCheck: true, fromPopState: true });
  }

  /**
   * Obtiene la vista previa en la pila histórica (si existe)
   */
  getPreviousView() {
    if (this.historyStack && this.historyStack.length > 0) {
      return this.historyStack[this.historyStack.length - 1];
    }
    return null;
  }

  _updateNavButtons(activeView) {
    const navButtons = document.querySelectorAll('.app-nav-btn');
    navButtons.forEach(btn => {
      const target = btn.getAttribute('data-view');
      if (target === activeView) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  _onViewActivated(viewName, options = {}) {
    try {
      if (viewName === 'dashboard') {
        if (typeof DashboardView !== 'undefined' && DashboardView.render) {
          DashboardView.render();
        }
      } else if (viewName === 'calendar') {
        if (typeof Calendar !== 'undefined' && Calendar.render) {
          Calendar.render();
        }
      } else if (viewName === 'sequences') {
        if (typeof SequenceView !== 'undefined' && SequenceView.render) {
          SequenceView.render();
        }
      } else if (viewName === 'history') {
        if (typeof HistoryView !== 'undefined' && HistoryView.render) {
          HistoryView.render();
        }
      } else if (viewName === 'recovery') {
        if (typeof RecoveryView !== 'undefined' && RecoveryView.render) {
          RecoveryView.render();
        }
      } else if (viewName === 'editor') {
        if (typeof ClassEditorView !== 'undefined') {
          if (options.classId) {
            ClassEditorView.loadClass(options.classId);
          } else if (typeof AppState !== 'undefined' && AppState.get('currentClassId')) {
            ClassEditorView.loadClass(AppState.get('currentClassId'));
          }
          setTimeout(() => {
            if (ClassEditorView.autoResizeAllTextareas) {
              ClassEditorView.autoResizeAllTextareas();
            }
          }, 50);
        }
      } else if (viewName === 'notebook') {
        if (typeof NotebookEditor !== 'undefined') {
          if (options.classId) {
            NotebookEditor.openByClassId(options.classId);
          } else if (typeof AppState !== 'undefined' && AppState.get('currentClassId')) {
            NotebookEditor.openByClassId(AppState.get('currentClassId'));
          }
        }
      }
    } catch (err) {
      console.error(`[AppRouter] Error al activar la vista "${viewName}":`, err);
    }
  }
}

const AppRouter = new AppRouterClass();

if (typeof window !== 'undefined') {
  window.AppRouter = AppRouter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppRouter;
}
