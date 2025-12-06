/**
 * LuminaEngine - Custom table rendering engine
 * Replaces Grid.js with a lightweight, custom implementation
 */

class LuminaGrid {
  constructor(config) {
    this.container = config.container;
    this.data = config.data;       // Full dataset (Array of Arrays)
    this.columns = config.columns; // Array of strings
    this.htmlCols = config.htmlCols || []; // Columns containing HTML/SVG
    
    // Extract row indices from data and remove the __rowIndex__ column
    this.rowIndices = this.data.map((row, i) => {
      // Try to find __rowIndex__ in the row
      const lastItem = row[row.length - 1];
      if (typeof lastItem === 'number' && row.length === this.columns.length + 1) {
        // Last item is a number and we have extra column - it's our row index
        return lastItem;
      }
      // Fallback: use the position in the array
      return i;
    });
    
    // Remove __rowIndex__ from columns and data
    if (this.columns[this.columns.length - 1] === '__rowIndex__') {
      this.columns = this.columns.slice(0, -1);
      this.data = this.data.map(row => row.slice(0, -1));
    }
    
    this.searchEnabled = config.searchEnabled !== false;
    this.searchHighlight = config.searchHighlight !== false;
    this.initialClasses = config.initialClasses || ""; // Store classes
    this.selectionEnabled = config.selectionEnabled !== false;
    this.selectionMode = config.selectionMode || "single";
    this.selectionReset = config.selectionReset !== false;
    this.filtersEnabled = config.filtersEnabled !== false;
    this.filtersHighlight = config.filtersHighlight !== false;
    this.paginationEnabled = config.paginationEnabled !== false;
    this.paginationLimit = config.paginationLimit || 10;
    this.paginationLimitOptions = config.paginationLimitOptions || [10, 25, 50, 100];
    this.paginationScroller = config.paginationScroller === true;
    this.paginationShowSummary = config.paginationShowSummary !== false;
    this.buttonsEnabled = config.buttonsEnabled !== false;
    
    // Handle new button structure
    this.buttonsColumnView = config.buttonsColumnView || {
      enabled: config.buttonsColumnToggle !== false,
      position: config.buttonsPosition || "top",
      visibleColumns: config.buttonsVisibleColumns || this.columns
    };
    
    this.buttonsDownloads = config.buttonsDownloads || {
      enabled: false,
      filename: null,
      formats: ['csv', 'json']
    };

    this.heatmap = config.heatmap || null;
    
    this.initialVisibleColumns = [...(this.buttonsColumnView.visibleColumns || this.columns)]; // Store initial state
    this.maximizable = config.maximizable !== false;
    this.minimizable = config.minimizable !== false;
    this.sortable = config.sortable !== false;
    this.sortHighlight = config.sortHighlight !== false;
    this.colHide = config.colHide === true;
    this.title = config.title || null;
    this.caption = config.caption || null;
    this.elementId = config.elementId;
    this.condFormatRules = config.condFormatRules || [];
    this.condFormatEdit = config.condFormatEdit === true;
    this.originalCondFormatRules = this.cloneCondFormatRules(this.condFormatRules);
    this.condFormatDirty = false;
    this.activeCondFormatDropdown = null;

    this.performance = config.performance || {};

    this.heatmap = config.heatmap || null;
    this.heatmapColumns = null;
    this.heatmapPalette = (this.heatmap && Array.isArray(this.heatmap.palette) && this.heatmap.palette.length >= 2)
      ? this.heatmap.palette
      : ['#f7fbff', '#6baed6', '#08306b'];
    
    // Layout configuration
    this.layout = config.layout || {};
    // Use explicit checks: if value is provided, use it; otherwise use default
    this.layoutStriped = this.layout.hasOwnProperty('striped') ? this.layout.striped : true;
    this.layoutBordered = this.layout.hasOwnProperty('bordered') ? this.layout.bordered : true;
    this.layoutBorderStyle = this.layout.borderStyle || "solid";
    this.layoutCompact = this.layout.hasOwnProperty('compact') ? this.layout.compact : false;
    this.layoutHover = this.layout.hasOwnProperty('hover') ? this.layout.hover : true;
    this.layoutFontSize = this.layout.fontSize || null;
    this.layoutHeaderHeight = this.layout.headerHeight || null;
    this.layoutRowHeight = this.layout.rowHeight || null;
    this.layoutCellPadding = this.layout.cellPadding || null;
    this.layoutCornerRadius = this.layout.cornerRadius || null;
    this.layoutShadow = this.layout.hasOwnProperty('shadow') ? this.layout.shadow : false;
    this.layoutShadowSize = this.layout.shadowSize || "medium";
    this.layoutHeaderSticky = this.layout.hasOwnProperty('headerSticky') ? this.layout.headerSticky : true;
    this.layoutFooterSticky = this.layout.hasOwnProperty('footerSticky') ? this.layout.footerSticky : false;
    this.layoutWrapText = this.layout.hasOwnProperty('wrapText') ? this.layout.wrapText : true;
    this.layoutTextAlign = this.layout.textAlign || "left";
    this.layoutHeaderAlign = this.layout.headerAlign || null;
    this.layoutHeaderBgColor = this.layout.headerBgColor || null;
    this.layoutHeaderColor = this.layout.headerColor || null;
    this.layoutHeaderFontWeight = this.layout.headerFontWeight || null;
    this.layoutHeaderFontSize = this.layout.headerFontSize || null;
    this.layoutVerticalAlign = this.layout.verticalAlign || "middle";
    this.layoutAnimation = this.layout.hasOwnProperty('animation') ? this.layout.animation : true;
    this.layoutAnimationDuration = this.layout.animationDuration || "0.3s";
    this.layoutWidth = this.layout.width || null;
    this.layoutHeight = this.layout.height || null;
    this.layoutMaxHeight = this.layout.maxHeight || null;
    
    // Performance flags
    this.virtualizationEnabled = this.performance.virtualization === true;
    this.virtualizationBuffer = Number.isFinite(this.performance.virtualizationBuffer) ? this.performance.virtualizationBuffer : 8;
    this.boundVirtualContainer = null;

    // Apply performance overrides
    if (this.performance.disableAnimations) {
      this.layoutAnimation = false;
    }
    if (this.performance.preferScroller === true) {
      this.paginationScroller = true;
    }
    if (this.performance.disableHtml) {
      this.htmlCols = [];
    }
    if (this.performance.disableHighlight) {
      this.searchHighlight = false;
      this.filtersHighlight = false;
    }
    if (this.performance.serverSide === true) {
      this.serverSide = true;
    } else {
      this.serverSide = false;
    }

    // Debounce setup for search and filters
    this.searchDebounceMs = Number.isFinite(this.performance.debounceSearchMs) ? this.performance.debounceSearchMs : 0;
    this.debouncedUpdateSearch = this.searchDebounceMs > 0 ? this.debounce(this.updateSearch.bind(this), this.searchDebounceMs) : null;
    this.filtersDebounceMs = Number.isFinite(this.performance.debounceFiltersMs) ? this.performance.debounceFiltersMs : 0;
    this.debouncedUpdateColumnFilter = this.filtersDebounceMs > 0 ? this.debounce((col, val) => this.updateColumnFilter(col, val), this.filtersDebounceMs) : null;

    // State
    this.state = {
      filteredData: [...this.data],
      filteredIndices: this.data.map((_, i) => i), // Track display indices
      filteredRowIndices: [...this.rowIndices], // Track persistent row indices
      sortColumns: [], // Array of {name: 'colName', asc: true/false}
      searchTerm: "",
      page: 1,
      rowsPerPage: this.paginationLimit,
      selectedRows: new Map(), // Map of originalRowIndex -> true (was Set, now Map)
      hiddenRows: new Set(), // Track hidden row indices
      columnFilters: {},
      lastSelectedRow: null,
      visibleColumns: [...(this.buttonsColumnView.visibleColumns || this.columns)],
      isFullscreen: false,
      isMinimized: false,
      wasMinimizedBeforeSearch: false,
      columnDropdownOpen: false,
      downloadDropdownOpen: false
    };

    // DOM References (to preserve search input focus)
    this.refs = {
      wrapper: null,
      searchInput: null,
      tableContainer: null,
      footer: null,
      condFormatResetBtn: null
    };

    // Initial processing and render
    this.initHeatmapStats();
    this.processData();
    this.render();
    
    // Add ESC key listener for fullscreen
    this.handleEscapeKey = (e) => {
      if (e.key === 'Escape' && this.state.isFullscreen) {
        this.toggleFullscreen();
      }
    };
    document.addEventListener('keydown', this.handleEscapeKey);
  }

  // --- CORE LOGIC ---

  updateSearch(term) {
    if (this.serverSide) {
      this.state.searchTerm = term.toLowerCase();
      this.renderTable();
      return;
    }
    const hadSearch = this.state.searchTerm !== '';
    const hasSearch = term !== '';
    
    // Track minimize state when search starts
    if (!hadSearch && hasSearch) {
      this.state.wasMinimizedBeforeSearch = this.state.isMinimized;
      // Auto-expand when searching
      if (this.state.isMinimized) {
        this.toggleMinimize();
      }
    }
    
    // Restore minimize state when search is cleared
    if (hadSearch && !hasSearch) {
      if (this.state.wasMinimizedBeforeSearch) {
        // Table was minimized before search, restore minimized state
        if (!this.state.isMinimized) {
          this.toggleMinimize();
        }
      }
    }
    
    // Store focus state for search input
    const activeElement = document.activeElement;
    let shouldRestoreFocus = false;
    let cursorPos = 0;
    
    if (activeElement && this.refs.searchInput && 
        (activeElement === this.refs.searchInput || 
         activeElement.classList.contains('lumina-search-clear'))) {
      shouldRestoreFocus = true;
      if (activeElement === this.refs.searchInput) {
        cursorPos = activeElement.selectionStart || term.length;
      } else {
        cursorPos = term.length;
      }
    }
    
    this.state.searchTerm = term.toLowerCase();
    this.processData();
    this.initHeatmapStats();
    this.state.page = 1; // Reset to page 1 on search
    this.renderTable(); // Only re-render table, not the whole wrapper
    
    // Restore focus to search input if it was active
    if (shouldRestoreFocus && this.refs.searchInput) {
      requestAnimationFrame(() => {
        if (this.refs.searchInput) {
          this.refs.searchInput.focus();
          this.refs.searchInput.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }
  }

  debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  bindVirtualScroll() {
    if (!this.virtualizationEnabled) return;
    if (!this.refs.tableContainer) return;
    if (!this.tableContainerScrollListener) {
      this.tableContainerScrollListener = () => {
        if (!this.virtualizationEnabled) return;
        if (this.virtualScrollRaf) cancelAnimationFrame(this.virtualScrollRaf);
        this.virtualScrollRaf = requestAnimationFrame(() => {
          this.virtualScrollRaf = null;
          this.renderTable();
        });
      };
    }
    if (this.boundVirtualContainer === this.refs.tableContainer) return;
    if (this.boundVirtualContainer && this.tableContainerScrollListener) {
      this.boundVirtualContainer.removeEventListener('scroll', this.tableContainerScrollListener);
    }
    this.boundVirtualContainer = this.refs.tableContainer;
    this.refs.tableContainer.addEventListener('scroll', this.tableContainerScrollListener);
  }

  getRowHeightPx() {
    if (this.layoutRowHeight) {
      const num = parseFloat(this.layoutRowHeight);
      if (Number.isFinite(num)) return num;
    }
    return 40;
  }

  applyHeatmap(cellEl, colName, value) {
    if (!this.heatmapColumns) return;
    const entry = this.heatmapColumns[colName];
    if (!entry) return;
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    const { min, max } = entry;
    cellEl.style.background = this.interpolateColor(this.heatmapPalette, min, max, num);
  }

  interpolateColor(palette, min, max, value) {
    if (isNaN(value)) return '#eee';
    if (max === min) return palette[palette.length - 1];
    const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const steps = palette.length - 1;
    const idx = Math.min(steps - 1, Math.floor(t * steps));
    const localT = (t * steps) - idx;
    const start = palette[idx];
    const end = palette[idx + 1];
    const mix = (c1, c2) => Math.round(c1 + (c2 - c1) * localT);
    const hexToRgb = (hex) => {
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
    };
    const [r1, g1, b1] = hexToRgb(start);
    const [r2, g2, b2] = hexToRgb(end);
    const r = mix(r1, r2);
    const g = mix(g1, g2);
    const b = mix(b1, b2);
    return `rgb(${r}, ${g}, ${b})`;
  }

  sort(colName) {
    if (!this.sortable) return;
    if (this.serverSide) return;
    
    // Don't sort if column is hidden
    if (!this.state.visibleColumns.includes(colName)) return;
    
    // Find if this column is already in sort stack
    const existingIndex = this.state.sortColumns.findIndex(s => s.name === colName);
    
    if (existingIndex !== -1) {
      // Column already sorted - cycle through states
      const current = this.state.sortColumns[existingIndex];
      if (current.asc) {
        // Currently ascending, switch to descending
        this.state.sortColumns[existingIndex] = { name: colName, asc: false };
      } else {
        // Currently descending, remove from sort stack
        this.state.sortColumns.splice(existingIndex, 1);
      }
    } else {
      // New column, add to sort stack with ascending
      this.state.sortColumns.push({ name: colName, asc: true });
    }
    
    this.processData();
    this.renderTable();
  }

  processData() {
    if (this.serverSide) {
      this.state.filteredData = [...this.data];
      this.state.filteredIndices = this.data.map((_, i) => i);
      this.state.filteredRowIndices = [...this.rowIndices];
      return;
    }
    // Track indices alongside data
    let resultWithIndices = this.data.map((row, index) => ({
      row,
      displayIndex: index,
      rowIndex: this.rowIndices[index]
    }));

    // 0. Filter out hidden rows (they won't appear in searches/filters)
    resultWithIndices = resultWithIndices.filter(item => !this.state.hiddenRows.has(item.rowIndex));

    // 1. Filter by global search (only search visible columns)
    if (this.state.searchTerm) {
      resultWithIndices = resultWithIndices.filter(item => {
        const row = item.row;
        const visibleCols = this.state.visibleColumns;
        return row.some((cell, index) => {
          if (!visibleCols.includes(this.columns[index])) return false;
          return String(cell).toLowerCase().includes(this.state.searchTerm);
        });
      });
    }

    // 2. Filter by column filters
    const filterEntries = Object.entries(this.state.columnFilters);
    if (filterEntries.length > 0) {
      resultWithIndices = resultWithIndices.filter(item => {
        const row = item.row;
        return filterEntries.every(([colName, value]) => {
          const colIndex = this.columns.indexOf(colName);
          if (colIndex === -1) return true; // Column not found
          const cellValue = String(row[colIndex]).toLowerCase();
          return cellValue.includes(value.toLowerCase());
        });
      });
    }

    // 3. Apply sorting (supports multi-column sorting)
    if (this.state.sortColumns.length > 0) {
      resultWithIndices.sort((a, b) => {
        for (const sortCol of this.state.sortColumns) {
          const colIndex = this.columns.indexOf(sortCol.name);
          const valA = a.row[colIndex];
          const valB = b.row[colIndex];
          
          // Compare numbers if both are numbers, else compare strings
          let compareResult = 0;
          if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
            compareResult = parseFloat(valA) - parseFloat(valB);
          } else {
            compareResult = String(valA).localeCompare(String(valB));
          }
          
          if (compareResult !== 0) {
            return sortCol.asc ? compareResult : -compareResult;
          }
        }
        return 0;
      });
    }

    // Store both filtered data and indices
    this.state.filteredData = resultWithIndices.map(item => item.row);
    this.state.filteredIndices = resultWithIndices.map(item => item.displayIndex);
    this.state.filteredRowIndices = resultWithIndices.map(item => item.rowIndex);
  }

  // --- Conditional Formatting Helpers ---

  cloneCondFormatRules(rules) {
    try {
      return JSON.parse(JSON.stringify(rules || []));
    } catch (e) {
      return []; // Fallback if cloning fails
    }
  }

  getCondFormatRulesForColumn(colName) {
    if (!this.condFormatRules || this.condFormatRules.length === 0) return [];
    return this.condFormatRules.filter(r => r && r.column === colName);
  }

  markCondFormatDirty() {
    this.condFormatDirty = true;
    this.updateCondFormatResetButton();
    this.updateCondFormatDirtyIndicators();
  }

  updateCondFormatResetButton() {
    if (!this.refs.condFormatResetBtn) return;
    this.refs.condFormatResetBtn.disabled = !this.condFormatDirty;
  }

  resetCondFormats() {
    this.condFormatRules = this.cloneCondFormatRules(this.originalCondFormatRules);
    this.condFormatDirty = false;
    this.closeActiveCondFormatDropdown();
    this.renderTable();
    this.updateCondFormatResetButton();
    this.updateCondFormatDirtyIndicators();
  }

  updateCondFormatDirtyIndicators() {
    if (!this.refs.wrapper) return;
    const icons = this.refs.wrapper.querySelectorAll('.lumina-condformat-icon');
    icons.forEach(icon => {
      if (this.condFormatDirty) {
        icon.classList.add('lumina-condformat-dirty');
      } else {
        icon.classList.remove('lumina-condformat-dirty');
      }
    });
  }

  closeActiveCondFormatDropdown() {
    if (this.activeCondFormatDropdown) {
      this.activeCondFormatDropdown.style.display = 'none';
      this.activeCondFormatDropdown = null;
    }
  }

  initHeatmapStats() {
    if (!this.heatmap || !Array.isArray(this.heatmap.columns)) {
      this.heatmapColumns = null;
      return;
    }
    // Always base min/max on the full dataset so colors stay stable across filters/pagination
    const sourceData = this.data;
    const colSet = new Set(this.heatmap.columns);
    const map = {};
    this.columns.forEach((colName, idx) => {
      if (!colSet.has(colName)) return;
      const values = sourceData.map(row => Number(row[idx])).filter(v => Number.isFinite(v));
      if (values.length === 0) return;
      map[colName] = {
        index: idx,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });
    this.heatmapColumns = map;
  }


  initCondFormatDropdownHandlers() {
    if (this.condFormatHandlersInitialized) return;
    this.condFormatHandlersInitialized = true;

    this.condFormatOutsideHandler = (e) => {
      if (!this.activeCondFormatDropdown) return;
      const isIcon = e.target.classList && e.target.classList.contains('lumina-condformat-icon');
      const insideDropdown = this.activeCondFormatDropdown.contains(e.target);

      if (e.type === 'click') {
        if (insideDropdown || isIcon) return;
        this.closeActiveCondFormatDropdown();
      } else if (e.type === 'keydown' && e.key === 'Escape') {
        this.closeActiveCondFormatDropdown();
      }
    };

    document.addEventListener('click', this.condFormatOutsideHandler);
    document.addEventListener('keydown', this.condFormatOutsideHandler);
  }

  updateColumnFilter(col, value) {
    if (this.serverSide) {
      this.state.columnFilters[col] = value;
      this.renderTable();
      return;
    }
    this.state.columnFilters[col] = value;
    this.processData();
    this.state.page = 1;
    
    // Store cursor position before re-render
    const activeElement = document.activeElement;
    let shouldRestoreFocus = false;
    let cursorPos = 0;
    
    if (activeElement && activeElement.tagName === 'INPUT' && activeElement.classList.contains('lumina-filter-input')) {
      const activeCol = activeElement.closest('th')?.dataset.columnId;
      if (col === activeCol) {
        shouldRestoreFocus = true;
        cursorPos = activeElement.selectionStart || value.length;
      }
    }
    
    this.renderTable();

    // Restore focus after DOM update
    if (shouldRestoreFocus) {
      requestAnimationFrame(() => {
        const input = this.refs.wrapper.querySelector(`th[data-column-id="${col}"] .lumina-filter-input`);
        if (input) {
          input.focus();
          input.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  // Highlight search terms in text (with HTML escaping for security)
  highlightText(text, searchTerm) {
    if (!searchTerm) return this.escapeHtml(text);

    // First escape the HTML
    const escaped = this.escapeHtml(text);
    
    // Then add highlighting to the escaped text
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark class="lumina-highlight">$1</mark>');
  }

  // --- RENDERING ---

  render() {
    this.container.innerHTML = "";
    this.initHeatmapStats();
    this.initCondFormatDropdownHandlers();
    
    // 1. Create Wrapper and apply original classes
    const wrapper = document.createElement("div");
    wrapper.className = this.initialClasses ? this.initialClasses + " lumina-wrapper" : "lumina-wrapper";
    
    // Apply fullscreen class if in fullscreen mode
    if (this.state.isFullscreen) {
      wrapper.classList.add("lumina-fullscreen");
    }
    
    // Apply layout classes - add or remove based on boolean values
    if (this.layoutStriped) wrapper.classList.add("lumina-striped");
    else wrapper.classList.remove("lumina-striped");
    
    if (this.layoutBordered) wrapper.classList.add("lumina-bordered");
    else wrapper.classList.remove("lumina-bordered");
    
    // Border style handling
    wrapper.classList.remove("lumina-border-dashed", "lumina-border-dotted", "lumina-border-solid", "lumina-border-none");
    if (this.layoutBorderStyle === "dashed") wrapper.classList.add("lumina-border-dashed");
    else if (this.layoutBorderStyle === "dotted") wrapper.classList.add("lumina-border-dotted");
    else if (this.layoutBorderStyle === "solid") wrapper.classList.add("lumina-border-solid");
    else if (this.layoutBorderStyle === "none") wrapper.classList.add("lumina-border-none");
    
    if (this.layoutCompact) wrapper.classList.add("lumina-compact");
    else wrapper.classList.remove("lumina-compact");
    
    if (this.layoutHover) wrapper.classList.add("lumina-hover");
    else wrapper.classList.remove("lumina-hover");
    
    // Shadow handling
    wrapper.classList.remove("lumina-shadow-small", "lumina-shadow-medium", "lumina-shadow-large", "lumina-shadow-none");
    if (this.layoutShadow) {
      wrapper.classList.add(`lumina-shadow-${this.layoutShadowSize}`);
    } else {
      wrapper.classList.add("lumina-shadow-none");
    }
    
    if (!this.layoutAnimation) wrapper.classList.add("lumina-no-animation");
    else wrapper.classList.remove("lumina-no-animation");
    
    if (!this.layoutWrapText) wrapper.classList.add("lumina-no-wrap");
    else wrapper.classList.remove("lumina-no-wrap");
    
    // Apply inline layout styles to wrapper
    if (this.layoutWidth) wrapper.style.width = this.layoutWidth;
    else wrapper.style.width = "";
    
    if (this.layoutHeight) wrapper.style.height = this.layoutHeight;
    else wrapper.style.height = "";
    
    if (this.layoutMaxHeight) wrapper.style.maxHeight = this.layoutMaxHeight;
    else wrapper.style.maxHeight = "";
    
    if (this.layoutFontSize) wrapper.style.fontSize = this.layoutFontSize;
    else wrapper.style.fontSize = "";
    
    if (this.layoutCornerRadius) wrapper.style.borderRadius = this.layoutCornerRadius;
    else wrapper.style.borderRadius = "";
    
    if (this.layoutAnimationDuration && this.layoutAnimation) {
      wrapper.style.setProperty('--lumina-animation-duration', this.layoutAnimationDuration);
    }
    
    this.refs.wrapper = wrapper;
    
    // 1.5. Add title if provided
    if (this.title) {
      const titleDiv = document.createElement("div");
      titleDiv.className = "lumina-title";
      titleDiv.textContent = this.title;
      wrapper.appendChild(titleDiv);
    }

    // Reset heatmap refs
    this.refs.heatmap = null;
    
    // 2. Build Header Controls
    const header = document.createElement("div");
    header.className = "lumina-head";

    const searchContainer = document.createElement("div");
    searchContainer.className = "lumina-search-container";
    if (this.searchEnabled) {
      const searchInput = document.createElement("input");
      searchInput.placeholder = "Type a keyword...";
      searchInput.className = "lumina-input lumina-search-input";
      searchInput.value = this.state.searchTerm;
      searchInput.type = "search";
      searchInput.setAttribute("aria-label", "Search table");
        if (this.debouncedUpdateSearch) {
          searchInput.oninput = (e) => this.debouncedUpdateSearch(e.target.value);
        } else {
          searchInput.oninput = (e) => this.updateSearch(e.target.value);
        }
      this.refs.searchInput = searchInput;
      
      if (this.state.searchTerm) {
        const clearBtn = document.createElement("button");
        clearBtn.innerHTML = "✕";
        clearBtn.className = "lumina-search-clear";
        clearBtn.setAttribute("aria-label", "Clear search");
        clearBtn.onclick = () => {
          searchInput.value = "";
          this.updateSearch("");
        };
        searchContainer.appendChild(clearBtn);
      }
      searchContainer.appendChild(searchInput);
    }
    header.appendChild(searchContainer);

    const controlsContainer = document.createElement("div");
    controlsContainer.className = "lumina-controls-container";

    if (this.filtersEnabled && Object.values(this.state.columnFilters).some(v => v)) {
      const clearFiltersBtn = document.createElement("button");
      clearFiltersBtn.className = "lumina-button lumina-clear-filters-button";
      clearFiltersBtn.innerText = "Reset Filters";
      clearFiltersBtn.onclick = () => this.clearFilters();
      controlsContainer.appendChild(clearFiltersBtn);
    }

    if (this.selectionEnabled && this.selectionReset) {
      const resetBtn = document.createElement("button");
      resetBtn.className = "lumina-button lumina-reset-selection-button";
      resetBtn.innerText = "Reset Selection";
      resetBtn.onclick = () => this.clearSelection();
      controlsContainer.appendChild(resetBtn);
    }
    
    // Add column toggle button if enabled
    if (this.buttonsEnabled && this.buttonsColumnView && this.buttonsColumnView.enabled) {
      const columnToggleWrapper = document.createElement("div");
      columnToggleWrapper.className = "lumina-column-toggle-wrapper";
      
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "lumina-button lumina-column-toggle-button";
      toggleBtn.innerHTML = "☰ Columns";
      toggleBtn.setAttribute("aria-label", "Toggle column visibility");
      
      const dropdown = document.createElement("div");
      dropdown.className = "lumina-column-dropdown";
      dropdown.style.display = this.state.columnDropdownOpen ? "block" : "none";
      
      // Add reset button at the top
      const resetOption = document.createElement("div");
      resetOption.className = "lumina-column-reset";
      resetOption.innerHTML = "↻ Reset Columns";
      resetOption.onclick = (e) => {
        e.stopPropagation();
        this.resetColumnVisibility();
      };
      dropdown.appendChild(resetOption);
      
      // Add separator
      const separator = document.createElement("div");
      separator.className = "lumina-column-separator";
      dropdown.appendChild(separator);
      
      this.columns.forEach(col => {
        const label = document.createElement("label");
        label.className = "lumina-column-option";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = this.state.visibleColumns.includes(col);
        checkbox.dataset.column = col;
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + col));
        dropdown.appendChild(label);
      });
      
      // Handle checkbox clicks - prevent closing
      dropdown.onclick = (e) => {
        e.stopPropagation();
        if (e.target.type === 'checkbox') {
          this.toggleColumn(e.target.dataset.column);
        }
      };
      
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        this.state.columnDropdownOpen = !this.state.columnDropdownOpen;
        dropdown.style.display = this.state.columnDropdownOpen ? "block" : "none";
      };
      
      // Close dropdown when clicking outside or pressing ESC
      const closeDropdown = (e) => {
        if (e.type === 'keydown' && e.key === 'Escape') {
          this.state.columnDropdownOpen = false;
          dropdown.style.display = "none";
        } else if (e.type === 'click' && !columnToggleWrapper.contains(e.target)) {
          this.state.columnDropdownOpen = false;
          dropdown.style.display = "none";
        }
      };
      document.addEventListener("click", closeDropdown);
      document.addEventListener("keydown", closeDropdown);
      
      columnToggleWrapper.appendChild(toggleBtn);
      columnToggleWrapper.appendChild(dropdown);
      controlsContainer.appendChild(columnToggleWrapper);
    }
    
    // Add hide selected rows button if selection is enabled
    if (this.selectionEnabled) {
      const hideBtn = document.createElement("button");
      hideBtn.className = "lumina-button lumina-hide-button";
      hideBtn.innerHTML = "👁️‍🗨️ Hide Selected";
      hideBtn.title = "Hide selected rows from view";
      hideBtn.onclick = () => this.hideSelectedRows();
      controlsContainer.appendChild(hideBtn);

      const unhideBtn = document.createElement("button");
      unhideBtn.className = "lumina-button lumina-unhide-button";
      unhideBtn.innerHTML = "👁️ Unhide All";
      unhideBtn.title = "Show all hidden rows";
      unhideBtn.onclick = () => this.unhideAllRows();
      unhideBtn.style.display = this.state.hiddenRows.size > 0 ? "inline-block" : "none";
      controlsContainer.appendChild(unhideBtn);
    }

    // Add download button if enabled
    if (this.buttonsEnabled && this.buttonsDownloads && this.buttonsDownloads.enabled) {
      const downloadWrapper = document.createElement("div");
      downloadWrapper.className = "lumina-download-wrapper";
      
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "lumina-button lumina-download-button";
      downloadBtn.innerHTML = "⬇ Download";
      downloadBtn.setAttribute("aria-label", "Download table data");
      
      const downloadDropdown = document.createElement("div");
      downloadDropdown.className = "lumina-download-dropdown";
      downloadDropdown.style.display = this.state.downloadDropdownOpen ? "block" : "none";
      
      // Filename input
      const filenameLabel = document.createElement("label");
      filenameLabel.style.display = "block";
      filenameLabel.style.marginBottom = "8px";
      filenameLabel.innerHTML = "<strong>Filename:</strong>";
      const filenameInput = document.createElement("input");
      filenameInput.type = "text";
      filenameInput.className = "lumina-download-filename";
      filenameInput.placeholder = "timestamp-table";
      filenameInput.value = this.buttonsDownloads.filename || "";
      filenameLabel.appendChild(filenameInput);
      downloadDropdown.appendChild(filenameLabel);
      
      // Format select
      const formatLabel = document.createElement("label");
      formatLabel.style.display = "block";
      formatLabel.style.marginBottom = "8px";
      formatLabel.innerHTML = "<strong>Format:</strong>";
      const formatSelect = document.createElement("select");
      formatSelect.className = "lumina-download-format";
      const formats = this.buttonsDownloads.formats || ['csv', 'json'];
      formats.forEach(format => {
        const option = document.createElement("option");
        option.value = format;
        option.textContent = format.toUpperCase();
        formatSelect.appendChild(option);
      });
      formatLabel.appendChild(formatSelect);
      downloadDropdown.appendChild(formatLabel);
      
      // Info box if data is incomplete
      const hasHiddenRows = this.state.hiddenRows.size > 0;
      const hasHiddenColumns = this.state.visibleColumns.length < this.columns.length;
      const hasFilters = this.state.searchTerm || Object.values(this.state.columnFilters).some(v => v);
      const isIncomplete = hasHiddenRows || hasHiddenColumns || hasFilters;
      
      if (isIncomplete) {
        const infoBox = document.createElement("div");
        infoBox.className = "lumina-download-info";
        infoBox.style.cssText = "background: #fff3cd; border: 1px solid #ffc107; padding: 8px; margin: 8px 0; border-radius: 4px; font-size: 11px;";
        let infoText = "⚠️ Download will exclude: ";
        const exclusions = [];
        if (hasHiddenRows) exclusions.push(`${this.state.hiddenRows.size} hidden row(s)`);
        if (hasHiddenColumns) exclusions.push(`${this.columns.length - this.state.visibleColumns.length} hidden column(s)`);
        if (hasFilters) exclusions.push("filtered-out rows");
        infoText += exclusions.join(", ");
        infoBox.textContent = infoText;
        downloadDropdown.appendChild(infoBox);
      }
      
      // Download current view button
      const downloadActionBtn = document.createElement("button");
      downloadActionBtn.className = "lumina-button lumina-download-action";
      downloadActionBtn.textContent = isIncomplete ? "Download Current View" : "Download";
      downloadActionBtn.style.width = "100%";
      downloadActionBtn.style.marginTop = "8px";
      downloadActionBtn.onclick = (e) => {
        e.stopPropagation();
        const filename = filenameInput.value.trim() || `${Date.now()}-table`;
        const format = formatSelect.value;
        this.downloadData(filename, format, false);
        // Close dropdown after download
        this.state.downloadDropdownOpen = false;
        downloadDropdown.style.display = "none";
      };
      downloadDropdown.appendChild(downloadActionBtn);
      
      // Download all data button (if incomplete)
      if (isIncomplete) {
        const downloadAllBtn = document.createElement("button");
        downloadAllBtn.className = "lumina-button lumina-download-all";
        downloadAllBtn.textContent = "Download All Data";
        downloadAllBtn.style.cssText = "width: 100%; margin-top: 4px; background: #28a745; color: white;";
        downloadAllBtn.onclick = (e) => {
          e.stopPropagation();
          const filename = filenameInput.value.trim() || `${Date.now()}-table-full`;
          const format = formatSelect.value;
          this.downloadData(filename, format, true);
          this.state.downloadDropdownOpen = false;
          downloadDropdown.style.display = "none";
        };
        downloadDropdown.appendChild(downloadAllBtn);
      }
      
      // Prevent dropdown from closing when clicking inside
      downloadDropdown.onclick = (e) => {
        e.stopPropagation();
      };
      
      downloadBtn.onclick = (e) => {
        e.stopPropagation();
        this.state.downloadDropdownOpen = !this.state.downloadDropdownOpen;
        downloadDropdown.style.display = this.state.downloadDropdownOpen ? "block" : "none";
      };
      
      // Close dropdown when clicking outside or pressing ESC
      const closeDownloadDropdown = (e) => {
        if (e.type === 'keydown' && e.key === 'Escape') {
          this.state.downloadDropdownOpen = false;
          downloadDropdown.style.display = "none";
        } else if (e.type === 'click' && !downloadWrapper.contains(e.target)) {
          this.state.downloadDropdownOpen = false;
          downloadDropdown.style.display = "none";
        }
      };
      document.addEventListener("click", closeDownloadDropdown);
      document.addEventListener("keydown", closeDownloadDropdown);
      
      downloadWrapper.appendChild(downloadBtn);
      downloadWrapper.appendChild(downloadDropdown);
      controlsContainer.appendChild(downloadWrapper);
    }

    // Reset conditional formats if edited
    if (this.condFormatEdit && this.condFormatRules && this.condFormatRules.length > 0) {
      const resetBtn = document.createElement("button");
      resetBtn.className = "lumina-button lumina-condformat-reset";
      resetBtn.innerText = "Reset Formats";
      resetBtn.disabled = !this.condFormatDirty;
      resetBtn.onclick = () => this.resetCondFormats();
      this.refs.condFormatResetBtn = resetBtn;
      controlsContainer.appendChild(resetBtn);
    }
    
    // Add minimize button if minimizable
    if (this.minimizable) {
      const minimizeBtn = document.createElement("button");
      minimizeBtn.className = "lumina-button lumina-minimize-button";
      minimizeBtn.innerHTML = this.state.isMinimized ? "▼" : "▲";
      minimizeBtn.title = this.state.isMinimized ? "Expand Table" : "Minimize Table";
      minimizeBtn.setAttribute("aria-label", this.state.isMinimized ? "Expand table" : "Minimize table");
      minimizeBtn.onclick = () => this.toggleMinimize();
      controlsContainer.appendChild(minimizeBtn);
    }
    
    // Add expand/collapse button if maximizable
    if (this.maximizable) {
      const expandBtn = document.createElement("button");
      expandBtn.className = "lumina-button lumina-expand-button";
      expandBtn.innerHTML = this.state.isFullscreen ? "⤓" : "⤢";
      expandBtn.title = this.state.isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen";
      expandBtn.setAttribute("aria-label", this.state.isFullscreen ? "Exit fullscreen" : "Expand to fullscreen");
      expandBtn.onclick = () => this.toggleFullscreen();
      controlsContainer.appendChild(expandBtn);
    }
    
    header.appendChild(controlsContainer);
    wrapper.appendChild(header);

    // 3. Build Table Container
    const tableContainer = document.createElement("div");
    tableContainer.className = "lumina-container";
    this.refs.tableContainer = tableContainer;

    // Build Table
    const table = document.createElement("table");
    table.className = "lumina-table";
    table.setAttribute("role", "grid");
    
    // Apply table layout styles
    if (this.layoutFontSize) table.style.fontSize = this.layoutFontSize;
    if (this.layoutHeight) table.style.height = this.layoutHeight;
    if (this.layoutTextAlign) table.style.textAlign = this.layoutTextAlign;
    if (this.layoutVerticalAlign) {
      table.style.setProperty('--lumina-vertical-align', this.layoutVerticalAlign);
    }
    if (this.layoutCellPadding) {
      table.style.setProperty('--lumina-cell-padding', this.layoutCellPadding);
    }
    if (this.layoutRowHeight) {
      table.style.setProperty('--lumina-row-height', this.layoutRowHeight);
    }
    if (this.layoutHeaderHeight) {
      table.style.setProperty('--lumina-header-height', this.layoutHeaderHeight);
    }

    // THEAD
    const thead = document.createElement("thead");
    thead.classList.add("lumina-sticky-header"); // Always sticky
    const headerAlign = this.layoutHeaderAlign || this.layoutTextAlign;
    if (headerAlign) thead.style.textAlign = headerAlign;
    const trHead = document.createElement("tr");
    this.columns.forEach((col, index) => {
      // Skip hidden columns
      if (!this.state.visibleColumns.includes(col)) return;
      
      const th = document.createElement("th");
      th.setAttribute("data-column-id", col);
      if (headerAlign) th.style.textAlign = headerAlign;
      
      // Apply sort highlight to header if column is sorted - use border if heatmap/conditional formatting present
      const isSorted = this.sortHighlight && this.state.sortColumns.some(s => s.name === col);
      if (isSorted) {
        const hasHeatmap = this.heatmapColumns && this.heatmapColumns[col];
        const hasCondFormat = this.condFormatRules && this.condFormatRules.some(r => r && r.column === col);
        if (hasHeatmap || hasCondFormat) {
          th.classList.add("lumina-sorted-column-border");
        } else {
          th.classList.add("lumina-sorted-column");
        }
      }
      
      if (this.layoutHeaderBgColor) th.style.backgroundColor = this.layoutHeaderBgColor;
      if (this.layoutHeaderColor) th.style.color = this.layoutHeaderColor;
      if (this.layoutHeaderFontWeight) th.style.fontWeight = this.layoutHeaderFontWeight;
      if (this.layoutHeaderFontSize) th.style.fontSize = this.layoutHeaderFontSize;
      th.style.position = "relative";
      
      const thContent = document.createElement("div");
      thContent.className = "lumina-th-content";
      // Apply flexbox alignment based on text alignment with !important to override CSS default
      if (headerAlign === 'center') {
        thContent.style.setProperty('justify-content', 'center', 'important');
      } else if (headerAlign === 'right') {
        thContent.style.setProperty('justify-content', 'flex-end', 'important');
      } else if (headerAlign === 'left') {
        thContent.style.setProperty('justify-content', 'flex-start', 'important');
      }
      
      // Add eye icon if colHide is enabled AND column toggle dropdown is enabled
      if (this.colHide && this.buttonsEnabled && this.buttonsColumnView && this.buttonsColumnView.enabled) {
        const eyeIcon = document.createElement("span");
        eyeIcon.className = "lumina-eye-icon";
        eyeIcon.innerHTML = "👁";
        eyeIcon.title = "Click to hide this column";
        eyeIcon.onclick = (e) => {
          e.stopPropagation();
          this.toggleColumn(col);
        };
        thContent.appendChild(eyeIcon);
      }
      
      const colText = document.createElement("span");
      colText.innerText = col;
      thContent.appendChild(colText);

      // Conditional formatting icon
      const colCondRules = this.getCondFormatRulesForColumn(col);
      if (colCondRules.length > 0) {
        th.style.position = "relative";

        const cfIcon = document.createElement("span");
        cfIcon.className = "lumina-condformat-icon";
        cfIcon.title = this.condFormatEdit ? "View or edit conditional formatting" : "View conditional formatting";
        cfIcon.innerText = "🎨";

        const dropdown = document.createElement("div");
        dropdown.className = "lumina-condformat-dropdown";
        dropdown.style.display = "none";

        const buildDropdown = () => {
          dropdown.innerHTML = "";
          const header = document.createElement("div");
          header.className = "lumina-condformat-header";
          header.innerHTML = `<strong>${col}</strong> formatting`;
          dropdown.appendChild(header);

          colCondRules.forEach((rule) => {
            const row = document.createElement("div");
            row.className = "lumina-condformat-row";

            const opSelect = document.createElement("select");
            ["eq","neq","gt","gte","lt","lte","between","contains","in"].forEach(opt => {
              const o = document.createElement("option");
              o.value = opt;
              o.textContent = opt;
              if ((rule.op || rule.operator || rule.rule || 'eq').toLowerCase() === opt) o.selected = true;
              opSelect.appendChild(o);
            });

            const valueInput = document.createElement("input");
            valueInput.type = "text";
            valueInput.placeholder = "value or a,b";
            if (rule.op === 'between' && Array.isArray(rule.range)) {
              valueInput.value = rule.range.join(',');
            } else if (rule.op === 'in' && Array.isArray(rule.values)) {
              valueInput.value = rule.values.join(',');
            } else if (rule.value !== undefined && rule.value !== null) {
              valueInput.value = rule.value;
            }

            const bgInput = document.createElement("input");
            bgInput.type = "text";
            bgInput.placeholder = "bg color";
            bgInput.value = rule.style?.bg || "";

            const colorInput = document.createElement("input");
            colorInput.type = "text";
            colorInput.placeholder = "text color";
            colorInput.value = rule.style?.color || "";

            const fwSelect = document.createElement("select");
            ["","normal","bold","600","700"].forEach(opt => {
              const o = document.createElement("option");
              o.value = opt;
              o.textContent = opt === "" ? "font weight" : opt;
              if ((rule.style?.fontWeight || "") === opt) o.selected = true;
              fwSelect.appendChild(o);
            });

            const applyChange = () => {
              rule.op = opSelect.value;
              if (rule.op === 'between') {
                const parts = valueInput.value.split(',').map(v => v.trim()).filter(v => v !== "");
                rule.range = parts.length === 2 ? [Number(parts[0]), Number(parts[1])] : undefined;
                rule.value = undefined;
                rule.values = undefined;
              } else if (rule.op === 'in') {
                const parts = valueInput.value.split(',').map(v => v.trim()).filter(v => v !== "");
                rule.values = parts;
                rule.value = undefined;
                rule.range = undefined;
              } else {
                rule.value = valueInput.value;
                rule.range = undefined;
                rule.values = undefined;
              }
              rule.style = rule.style || {};
              rule.style.bg = bgInput.value || undefined;
              rule.style.color = colorInput.value || undefined;
              rule.style.fontWeight = fwSelect.value || undefined;
              this.markCondFormatDirty();
              this.updateTableBody();
            };

            if (this.condFormatEdit) {
              [opSelect, valueInput, bgInput, colorInput, fwSelect].forEach(inputEl => {
                inputEl.onchange = applyChange;
              });
            } else {
              [opSelect, valueInput, bgInput, colorInput, fwSelect].forEach(el => el.disabled = true);
            }

            row.appendChild(opSelect);
            row.appendChild(valueInput);
            row.appendChild(bgInput);
            row.appendChild(colorInput);
            row.appendChild(fwSelect);
            dropdown.appendChild(row);
          });

          if (!this.condFormatEdit) {
            const note = document.createElement("div");
            note.className = "lumina-condformat-note";
            note.textContent = "Conditional formatting is view-only.";
            dropdown.appendChild(note);
          }
        };

        buildDropdown();

        cfIcon.onclick = (e) => {
          e.stopPropagation();
          if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
            this.activeCondFormatDropdown = null;
          } else {
            this.closeActiveCondFormatDropdown();
            dropdown.style.display = "block";
            this.activeCondFormatDropdown = dropdown;
          }
        };

        thContent.appendChild(cfIcon);
        th.appendChild(dropdown);
      }
      // Add sort indicator
      if (this.sortable) {
        const sortIcon = document.createElement("span");
        sortIcon.className = "lumina-sort-icon";
        
        // Check if this column is in the sort stack
        const sortIndex = this.state.sortColumns.findIndex(s => s.name === col);
        
        if (sortIndex !== -1) {
          // Active sort - show solid icon with priority number
          const sortCol = this.state.sortColumns[sortIndex];
          sortIcon.classList.add("lumina-sort-icon-active");
          const arrow = sortCol.asc ? "▲" : "▼";
          const priority = this.state.sortColumns.length > 1 ? (sortIndex + 1) : "";
          sortIcon.innerText = ` ${arrow}${priority}`;
        } else {
          // Inactive - show faded icon
          sortIcon.classList.add("lumina-sort-icon-inactive");
          sortIcon.innerHTML = " <span style='opacity: 0.3;'>⇅</span>";
        }
        
        thContent.appendChild(sortIcon);
      }
      
      th.appendChild(thContent);
      th.onclick = (e) => {
        const target = e.target;
        const inCondDropdown = target.closest('.lumina-condformat-dropdown');
        const onCondIcon = target.classList && target.classList.contains('lumina-condformat-icon');
        const isFormControl = ['INPUT','SELECT','TEXTAREA','OPTION','BUTTON'].includes(target.tagName);
        if (inCondDropdown || onCondIcon || isFormControl) return;
        this.sort(col);
      };
      th.setAttribute("tabindex", "0");
      th.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.sort(col);
          }
        }
      };
      
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    if (this.filtersEnabled) {
        const trFilter = document.createElement("tr");
        trFilter.className = "lumina-filter-row";
        this.columns.forEach((col, index) => {
            // Skip hidden columns
            if (!this.state.visibleColumns.includes(col)) return;
            
            const th = document.createElement("th");
            th.dataset.columnId = col;

            const filterWrapper = document.createElement('div');
            filterWrapper.className = 'lumina-filter-wrapper';

            const filterInput = document.createElement("input");
            filterInput.type = "text";
            filterInput.className = "lumina-filter-input";
            filterInput.placeholder = "Filter...";
            filterInput.value = this.state.columnFilters[col] || "";
            if (this.debouncedUpdateColumnFilter) {
              filterInput.oninput = (e) => this.debouncedUpdateColumnFilter(col, e.target.value);
            } else {
              filterInput.oninput = (e) => this.updateColumnFilter(col, e.target.value);
            }
            
            filterWrapper.appendChild(filterInput);

            if (this.state.columnFilters[col]) {
                const clearBtn = document.createElement("button");
                clearBtn.innerHTML = "&times;";
                clearBtn.className = "lumina-filter-clear";
                clearBtn.setAttribute("aria-label", `Clear filter for ${col}`);
                clearBtn.onclick = () => {
                    this.updateColumnFilter(col, "");
                };
                filterWrapper.appendChild(clearBtn);
            }

            th.appendChild(filterWrapper);
            trFilter.appendChild(th);
        });
        thead.appendChild(trFilter);
    }
    
    table.appendChild(thead);

    // TBODY
    const tbody = document.createElement("tbody");
    
    // Pagination / virtualization logic
    let pageData;
    let start = 0;
    let topSpacerPx = 0;
    let bottomSpacerPx = 0;
    const totalRows = this.state.filteredData.length;
    if (this.paginationEnabled && this.paginationScroller && this.virtualizationEnabled) {
      const rowH = this.getRowHeightPx();
      const containerHeight = this.refs.tableContainer ? this.refs.tableContainer.clientHeight || (this.paginationLimit * rowH) : this.paginationLimit * rowH;
      const scrollTop = this.refs.tableContainer ? this.refs.tableContainer.scrollTop : 0;
      const first = Math.max(0, Math.floor(scrollTop / rowH) - this.virtualizationBuffer);
      const visibleCount = Math.ceil(containerHeight / rowH) + (this.virtualizationBuffer * 2);
      const last = Math.min(totalRows, first + visibleCount);
      start = first;
      pageData = this.state.filteredData.slice(first, last);
      topSpacerPx = first * rowH;
      bottomSpacerPx = Math.max(0, (totalRows - last) * rowH);
    } else if (this.paginationEnabled && this.paginationScroller) {
      pageData = this.state.filteredData;
      start = 0;
    } else {
      // Regular pagination: show only current page
      start = (this.state.page - 1) * this.state.rowsPerPage;
      const end = start + this.state.rowsPerPage;
      pageData = this.state.filteredData.slice(start, end);
    }

    if (pageData.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = this.state.visibleColumns.length;
      td.className = "lumina-notfound";
      td.innerText = this.state.searchTerm ? "No matching records found" : "No records found";
      td.setAttribute("role", "alert");
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      if (topSpacerPx > 0) {
        const spacerTop = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${topSpacerPx}px`;
        spacerTop.appendChild(spacerTd);
        tbody.appendChild(spacerTop);
      }
      pageData.forEach((rowData, pageIndex) => {
        const tr = document.createElement("tr");
        // Calculate index in filteredData using pageIndex and pagination offset
        const filteredIndex = pageIndex + start;
        const rowIndex = this.state.filteredRowIndices[filteredIndex];
        tr.setAttribute("data-row-index", rowIndex);

        if (this.selectionEnabled) {
          tr.style.cursor = "pointer";
          tr.onclick = (e) => this.handleRowClick(rowIndex, e);
        }

        if (this.state.selectedRows.has(rowIndex)) {
          tr.classList.add("lumina-selected");
        }

        rowData.forEach((cellData, index) => {
          const colName = this.columns[index];
          // Skip hidden columns
          if (!this.state.visibleColumns.includes(colName)) return;
          
          const td = document.createElement("td");
          if (this.layoutTextAlign) td.style.textAlign = this.layoutTextAlign;
          
          // Check if this column allows HTML (Sparklines)
          if (this.htmlCols.includes(colName)) {
              td.innerHTML = cellData;
          } else {
              // Apply highlighting if search is active
              if (this.state.searchTerm && this.searchHighlight) {
                td.innerHTML = this.highlightText(cellData, this.state.searchTerm);
              } else {
                td.innerText = cellData;
              }
          }
          this.applyHeatmap(td, colName, cellData);
          this.applyConditionalFormatting(td, tr, colName, cellData);
          
          // Apply sort highlight - use border if heatmap/conditional formatting present
          const isSorted = this.sortHighlight && this.state.sortColumns.some(s => s.name === colName);
          if (isSorted) {
            const hasHeatmap = this.heatmapColumns && this.heatmapColumns[colName];
            const hasCondFormat = this.condFormatRules && this.condFormatRules.some(r => r && r.column === colName);
            if (hasHeatmap || hasCondFormat) {
              td.classList.add("lumina-sorted-column-border");
            } else {
              td.classList.add("lumina-sorted-column");
            }
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      if (bottomSpacerPx > 0) {
        const spacerBottom = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${bottomSpacerPx}px`;
        spacerBottom.appendChild(spacerTd);
        tbody.appendChild(spacerBottom);
      }
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    wrapper.appendChild(tableContainer);

    // 5. Pagination Controls
    if (this.paginationEnabled && !this.paginationScroller) {
        const footer = document.createElement("div");
        footer.className = "lumina-footer";
        if (this.layoutFooterSticky) wrapper.classList.add("lumina-footer-sticky");
        this.refs.footer = footer;
  
        const totalPages = Math.ceil(this.state.filteredData.length / this.state.rowsPerPage);
        // Page controls
        const pages = document.createElement("div");
        pages.className = "lumina-pages";
        
        if (this.state.page > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.className = "lumina-pagination-button lumina-pagination-button-prev";
            prevBtn.innerText = "Previous";
            prevBtn.setAttribute("aria-label", "Previous page");
            prevBtn.onclick = () => { this.state.page--; this.renderTable(); };
            pages.appendChild(prevBtn);
        }
        
        // Page numbers (show current and up to 2 on each side)
        const pageStart = Math.max(1, this.state.page - 2);
        const pageEnd = Math.min(totalPages, this.state.page + 2);
        
        if (pageStart > 1) {
          const firstBtn = document.createElement("button");
          firstBtn.className = "lumina-pagination-button";
          firstBtn.innerText = "1";
          firstBtn.onclick = () => { this.state.page = 1; this.renderTable(); };
          pages.appendChild(firstBtn);
          
          if (pageStart > 2) {
            const dots = document.createElement("span");
            dots.className = "lumina-pagination-dots";
            dots.innerText = "...";
            pages.appendChild(dots);
          }
        }
        
        for (let i = pageStart; i <= pageEnd; i++) {
          const pageBtn = document.createElement("button");
          pageBtn.className = "lumina-pagination-button";
          if (i === this.state.page) {
            pageBtn.classList.add("lumina-pagination-button-current");
          }
          pageBtn.innerText = i;
          pageBtn.setAttribute("aria-label", `Page ${i}`);
          pageBtn.onclick = () => { this.state.page = i; this.renderTable(); };
          pages.appendChild(pageBtn);
        }
        
        if (pageEnd < totalPages) {
          if (pageEnd < totalPages - 1) {
            const dots = document.createElement("span");
            dots.className = "lumina-pagination-dots";
            dots.innerText = "...";
            pages.appendChild(dots);
          }
          
          const lastBtn = document.createElement("button");
          lastBtn.className = "lumina-pagination-button";
          lastBtn.innerText = totalPages;
          lastBtn.onclick = () => { this.state.page = totalPages; this.renderTable(); };
          pages.appendChild(lastBtn);
        }
        
        if (this.state.page < totalPages) {
            const nextBtn = document.createElement("button");
            nextBtn.className = "lumina-pagination-button lumina-pagination-button-next";
            nextBtn.innerText = "Next";
            nextBtn.setAttribute("aria-label", "Next page");
            nextBtn.onclick = () => { this.state.page++; this.renderTable(); };
            pages.appendChild(nextBtn);
        }
        footer.appendChild(pages);

        if (this.paginationEnabled && !this.paginationScroller) {
            const limiterWrapper = document.createElement('div')
            limiterWrapper.className = 'lumina-pagination-limiter'
            const limitOptions = document.createElement("select");
            limitOptions.className = "lumina-pagination-limit";
            this.paginationLimitOptions.forEach(option => {
              const opt = document.createElement("option");
              opt.value = option;
              opt.innerText = `${option} / page`;
              if (option === this.state.rowsPerPage) {
                opt.selected = true;
              }
              limitOptions.appendChild(opt);
            });
            limitOptions.onchange = (e) => this.handleLimitChange(e.target.value);
            limiterWrapper.appendChild(limitOptions)
            footer.appendChild(limiterWrapper);
        }
        
        if (this.paginationShowSummary) {
            const summary = document.createElement("div");
            summary.className = "lumina-summary";
            const startRow = this.state.filteredData.length > 0 ? (this.state.page - 1) * this.state.rowsPerPage + 1 : 0;
            const endRow = Math.min(this.state.page * this.state.rowsPerPage, this.state.filteredData.length);
            const selectedCount = this.selectionEnabled ? this.state.selectedRows.size : 0;
            const selectedText = this.selectionEnabled && selectedCount > 0 ? ` <span style="color: #666;">(selected: ${selectedCount})</span>` : "";
            const hiddenCount = this.state.hiddenRows.size;
            const hiddenText = hiddenCount > 0 ? ` <span style="color: #ff6b6b;">(${hiddenCount} hidden)</span>` : "";
            const sortedText = this.state.sortColumns.length > 0 ? ` <span style="color: #666;">(sorted)</span>` : "";
            summary.innerHTML = `Showing <b>${startRow}</b> to <b>${endRow}</b> of <b>${this.state.filteredData.length}</b> results${selectedText}${hiddenText}${sortedText}`;
            summary.setAttribute("role", "status");
            summary.setAttribute("aria-live", "polite");
            footer.appendChild(summary);
        }
  
        wrapper.appendChild(footer);
    } else if (this.paginationEnabled && this.paginationScroller) {
      // Scroller mode: set max height and enable scrolling
      const rowH = this.getRowHeightPx();
      this.refs.tableContainer.style.maxHeight = (this.paginationLimit * rowH) + "px";
      this.refs.tableContainer.style.overflowY = "auto";
      this.bindVirtualScroll();
      
      // Add footer with summary for scroller mode
      if (this.paginationShowSummary) {
        const footer = document.createElement("div");
        footer.className = "lumina-footer";
        if (this.layoutFooterSticky) wrapper.classList.add("lumina-footer-sticky");
        const summary = document.createElement("div");
        summary.className = "lumina-summary";
        const selectedCount = this.selectionEnabled ? this.state.selectedRows.size : 0;
        const selectedText = this.selectionEnabled && selectedCount > 0 ? ` <span style="color: #666;">(selected: ${selectedCount})</span>` : "";
        summary.innerHTML = `Showing <b>${this.state.filteredData.length}</b> results (scroll to view all)${selectedText}`;
        summary.setAttribute("role", "status");
        summary.setAttribute("aria-live", "polite");
        footer.appendChild(summary);
        wrapper.appendChild(footer);
      }
    }
    
    // 7. Add caption if provided
    if (this.caption) {
      const captionDiv = document.createElement("div");
      captionDiv.className = "lumina-caption";
      captionDiv.textContent = this.caption;
      wrapper.appendChild(captionDiv);
    }
    
    this.container.appendChild(wrapper);
  }

  toggleColumn(columnName) {
    const index = this.state.visibleColumns.indexOf(columnName);
    if (index > -1) {
      // Hide column
      this.state.visibleColumns.splice(index, 1);
      
      // Remove any active filter for this column
      if (this.state.columnFilters[columnName]) {
        delete this.state.columnFilters[columnName];
        this.processData();
      }
      
      // Remove from sort stack if hiding a sorted column
      const sortIndex = this.state.sortColumns.findIndex(s => s.name === columnName);
      if (sortIndex !== -1) {
        this.state.sortColumns.splice(sortIndex, 1);
        this.processData();
      }
    } else {
      // Show column - maintain original order
      const originalIndex = this.columns.indexOf(columnName);
      let insertIndex = 0;
      for (let i = 0; i < originalIndex; i++) {
        if (this.state.visibleColumns.includes(this.columns[i])) {
          insertIndex++;
        }
      }
      this.state.visibleColumns.splice(insertIndex, 0, columnName);
    }
    // Re-render entire view to update both table and checkboxes
    this.render();
  }

  resetColumnVisibility() {
    // Restore original column visibility
    this.state.visibleColumns = [...this.initialVisibleColumns];
    
    // Clear all column filters to avoid confusion
    // (filters from previously hidden columns should not persist)
    this.state.columnFilters = {};
    
    // Re-process data since filters changed
    this.processData();
    
    // Re-render entire view
    this.render();
  }

  downloadData(filename, format, downloadAll = false) {
    // Determine which data to export
    let dataToExport;
    let columnsToExport;
    
    if (downloadAll) {
      // Export all data with all columns
      dataToExport = this.data;
      columnsToExport = this.columns;
    } else {
      // Export current filtered view (excludes hidden rows and filtered rows)
      dataToExport = this.state.filteredData;
      columnsToExport = this.state.visibleColumns;
    }
    
    // Get current filtered data with only specified columns
    const exportData = dataToExport.map(row => {
      const filteredRow = {};
      columnsToExport.forEach(col => {
        const colIndex = this.columns.indexOf(col);
        filteredRow[col] = row[colIndex];
      });
      return filteredRow;
    });
    
    let content, mimeType, fileExt;
    
    if (format === 'csv') {
      // Generate CSV
      const headers = columnsToExport.join(',');
      const rows = exportData.map(row => {
        return columnsToExport.map(col => {
          const val = String(row[col] || '');
          // Escape quotes and wrap in quotes if contains comma or quote
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(',');
      });
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileExt = 'csv';
    } else if (format === 'json') {
      // Generate JSON
      content = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      fileExt = 'json';
    } else if (format === 'xlsx') {
      // Generate XLSX using SheetJS library
      if (typeof XLSX === 'undefined') {
        alert('XLSX library not loaded. Please include SheetJS library.');
        console.error('XLSX library is required for Excel export. Include: https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js');
        return;
      }
      
      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      
      // Generate XLSX file
      XLSX.writeFile(wb, `${filename}.xlsx`);
      return; // Early return, XLSX handles the download
    } else {
      console.error('Unsupported format:', format);
      return;
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  handleRowClick(rowIndex, event) {
    if (!this.selectionEnabled) return;

    const { selectedRows, lastSelectedRow } = this.state;
    const isSelected = selectedRows.has(rowIndex);

    if (this.selectionMode === "multiple" && event.shiftKey && lastSelectedRow !== null) {
      const start = Math.min(rowIndex, lastSelectedRow);
      const end = Math.max(rowIndex, lastSelectedRow);
      for (let i = start; i <= end; i++) {
        selectedRows.set(i, true);
      }
    } else if (this.selectionMode === "single") {
      selectedRows.clear();
      if (!isSelected) {
        selectedRows.set(rowIndex, true);
      }
    } else { // multiple
      if (isSelected) {
        selectedRows.delete(rowIndex);
      } else {
        selectedRows.set(rowIndex, true);
      }
    }

    this.state.lastSelectedRow = rowIndex;
    this.renderTable();
    this.sendSelectedRowsToShiny();
  }

  handleLimitChange(limit) {
    this.state.rowsPerPage = parseInt(limit);
    this.state.page = 1;
    this.render();
  }

  clearFilters() {
    this.state.columnFilters = {};
    this.processData();
    this.render();
  }

  clearSelection() {
    this.state.selectedRows.clear();
    // Only update the table body, not the entire table structure
    this.updateTableBody();
    
    // Update pagination summary to remove selected count
    this.updatePaginationSummary();
    
    this.sendSelectedRowsToShiny();
  }

  hideSelectedRows() {
    if (this.state.selectedRows.size === 0) {
      return;
    }
    
    // Add selected rows to hidden set (using row indices)
    this.state.selectedRows.forEach((_, rowIndex) => {
      this.state.hiddenRows.add(rowIndex);
    });
    
    // Clear selection
    this.state.selectedRows.clear();
    this.state.lastSelectedRow = null;
    
    // Reprocess data and re-render
    this.processData();
    this.state.page = 1; // Reset to first page
    this.render();
  }

  unhideAllRows() {
    this.state.hiddenRows.clear();
    
    // Reprocess data and re-render
    this.processData();
    this.render();
  }
  
  updatePaginationSummary() {
    // Update the summary text in the footer to reflect current selection
    const summary = this.refs.footer?.querySelector('.lumina-summary');
    if (!summary) return;
    
    const startRow = this.state.filteredData.length > 0 ? (this.state.page - 1) * this.state.rowsPerPage + 1 : 0;
    const endRow = Math.min(this.state.page * this.state.rowsPerPage, this.state.filteredData.length);
    const selectedCount = this.selectionEnabled ? this.state.selectedRows.size : 0;
    const selectedText = this.selectionEnabled && selectedCount > 0 ? ` <span style="color: #666;">(selected: ${selectedCount})</span>` : "";
    const hiddenCount = this.state.hiddenRows.size;
    const hiddenText = hiddenCount > 0 ? ` <span style="color: #ff6b6b;">(${hiddenCount} hidden)</span>` : "";
    const sortedText = this.state.sortColumns.length > 0 ? ` <span style="color: #666;">(sorted)</span>` : "";
    
    if (this.paginationScroller) {
      summary.innerHTML = `Showing <b>${this.state.filteredData.length}</b> results (scroll to view all)${selectedText}${hiddenText}${sortedText}`;
    } else {
      summary.innerHTML = `Showing <b>${startRow}</b> to <b>${endRow}</b> of <b>${this.state.filteredData.length}</b> results${selectedText}${hiddenText}${sortedText}`;
    }
  }

  sendSelectedRowsToShiny() {
    if (Shiny && Shiny.setInputValue) {
      const selectedData = Array.from(this.state.selectedRows.keys()).map(rowIndex => {
        const displayIndex = this.rowIndices.indexOf(rowIndex);
        const row = this.data[displayIndex];
        const obj = {};
        this.columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        // Include the persistent row index
        obj['__rowIndex__'] = rowIndex;
        return obj;
      });
      Shiny.setInputValue(this.elementId + "_selected", selectedData);
    }
  }

  applyConditionalFormatting(td, tr, colName, rawValue) {
    if (!this.condFormatRules || this.condFormatRules.length === 0) return;

    const stringValue = rawValue === null || rawValue === undefined ? '' : String(rawValue);
    const numericValue = parseFloat(stringValue);
    const hasNumeric = !Number.isNaN(numericValue) && stringValue.trim() !== '';

    this.condFormatRules.forEach((rule) => {
      if (!rule || rule.column !== colName) return;

      const op = (rule.op || rule.operator || rule.rule || 'eq').toLowerCase();
      const target = rule.target === 'row' ? 'row' : 'cell';
      let match = false;

      switch (op) {
        case 'gt':
          match = hasNumeric && numericValue > Number(rule.value);
          break;
        case 'gte':
          match = hasNumeric && numericValue >= Number(rule.value);
          break;
        case 'lt':
          match = hasNumeric && numericValue < Number(rule.value);
          break;
        case 'lte':
          match = hasNumeric && numericValue <= Number(rule.value);
          break;
        case 'neq':
        case 'ne':
          if (hasNumeric && !Number.isNaN(Number(rule.value))) {
            match = numericValue !== Number(rule.value);
          } else {
            match = stringValue !== String(rule.value ?? '');
          }
          break;
        case 'between': {
          const range = rule.range || rule.values || rule.value;
          if (Array.isArray(range) && range.length === 2) {
            const low = Number(range[0]);
            const high = Number(range[1]);
            match = hasNumeric && !Number.isNaN(low) && !Number.isNaN(high) && numericValue >= low && numericValue <= high;
          }
          break;
        }
        case 'contains':
          match = stringValue.toLowerCase().includes(String(rule.value ?? '').toLowerCase());
          break;
        case 'in': {
          const list = rule.values || rule.value;
          if (Array.isArray(list)) {
            const lookup = list.map(v => String(v));
            match = lookup.includes(stringValue);
          }
          break;
        }
        case 'eq':
        default:
          if (hasNumeric && !Number.isNaN(Number(rule.value))) {
            match = numericValue === Number(rule.value);
          } else {
            match = stringValue === String(rule.value ?? '');
          }
          break;
      }

      if (!match) return;

      const targetEl = target === 'row' ? tr : td;
      if (!targetEl) return;
      const style = rule.style || {};

      if (style.bg) targetEl.style.backgroundColor = style.bg;
      if (style.color) targetEl.style.color = style.color;
      if (style.fontWeight) targetEl.style.fontWeight = style.fontWeight;
      if (style.fontStyle) targetEl.style.fontStyle = style.fontStyle;
      if (style.textDecoration) targetEl.style.textDecoration = style.textDecoration;
      if (style.border) targetEl.style.border = style.border;
      if (style.class) targetEl.classList.add(style.class);
    });
  }


  // Render only table and footer (preserve search input focus)
  renderTable() {
    if (!this.refs.tableContainer || !this.refs.footer) {
      // Fallback to full render if refs not initialized
      return this.render();
    }

    // Recompute heatmap stats on current filtered data so colors persist across pagination/scroller
    this.initHeatmapStats();

    // Clear existing table before rendering new one
    this.refs.tableContainer.innerHTML = "";

    // Build Table
    const table = document.createElement("table");
    table.className = "lumina-table";
    table.setAttribute("role", "grid");
    
    // Apply table layout styles
    if (this.layoutFontSize) table.style.fontSize = this.layoutFontSize;
    if (this.layoutHeight) table.style.height = this.layoutHeight;
    if (this.layoutTextAlign) table.style.textAlign = this.layoutTextAlign;
    if (this.layoutVerticalAlign) {
      table.style.setProperty('--lumina-vertical-align', this.layoutVerticalAlign);
    }
    if (this.layoutCellPadding) {
      table.style.setProperty('--lumina-cell-padding', this.layoutCellPadding);
    }
    if (this.layoutRowHeight) {
      table.style.setProperty('--lumina-row-height', this.layoutRowHeight);
    }
    if (this.layoutHeaderHeight) {
      table.style.setProperty('--lumina-header-height', this.layoutHeaderHeight);
    }

    // THEAD
    const thead = document.createElement("thead");
    thead.classList.add("lumina-sticky-header"); // Always sticky
    const headerAlign = this.layoutHeaderAlign || this.layoutTextAlign;
    if (headerAlign) thead.style.textAlign = headerAlign;
    if (this.layoutHeaderBgColor) thead.style.backgroundColor = this.layoutHeaderBgColor;
    if (this.layoutHeaderColor) thead.style.color = this.layoutHeaderColor;
    if (this.layoutHeaderFontWeight) thead.style.fontWeight = this.layoutHeaderFontWeight;
    if (this.layoutHeaderFontSize) thead.style.fontSize = this.layoutHeaderFontSize;
    const trHead = document.createElement("tr");
    this.columns.forEach((col, index) => {
      // Skip hidden columns
      if (!this.state.visibleColumns.includes(col)) return;
      
      const th = document.createElement("th");
      th.setAttribute("data-column-id", col);
      if (headerAlign) th.style.textAlign = headerAlign;
      
      // Apply sort highlight to header if column is sorted - use border if heatmap/conditional formatting present
      const isSorted = this.sortHighlight && this.state.sortColumns.some(s => s.name === col);
      if (isSorted) {
        const hasHeatmap = this.heatmapColumns && this.heatmapColumns[col];
        const hasCondFormat = this.condFormatRules && this.condFormatRules.some(r => r && r.column === col);
        if (hasHeatmap || hasCondFormat) {
          th.classList.add("lumina-sorted-column-border");
        } else {
          th.classList.add("lumina-sorted-column");
        }
      }
      
      if (this.layoutHeaderBgColor) th.style.backgroundColor = this.layoutHeaderBgColor;
      if (this.layoutHeaderColor) th.style.color = this.layoutHeaderColor;
      if (this.layoutHeaderFontWeight) th.style.fontWeight = this.layoutHeaderFontWeight;
      if (this.layoutHeaderFontSize) th.style.fontSize = this.layoutHeaderFontSize;
      th.style.position = "relative";
      
      const thContent = document.createElement("div");
      thContent.className = "lumina-th-content";
      // Apply flexbox alignment based on text alignment with !important to override CSS default
      if (headerAlign === 'center') {
        thContent.style.setProperty('justify-content', 'center', 'important');
      } else if (headerAlign === 'right') {
        thContent.style.setProperty('justify-content', 'flex-end', 'important');
      } else if (headerAlign === 'left') {
        thContent.style.setProperty('justify-content', 'flex-start', 'important');
      }
      
      // Add eye icon if colHide is enabled AND column toggle dropdown is enabled
      if (this.colHide && this.buttonsEnabled && this.buttonsColumnView && this.buttonsColumnView.enabled) {
        const eyeIcon = document.createElement("span");
        eyeIcon.className = "lumina-eye-icon";
        eyeIcon.innerHTML = "👁";
        eyeIcon.title = "Click to hide this column";
        eyeIcon.onclick = (e) => {
          e.stopPropagation();
          this.toggleColumn(col);
        };
        thContent.appendChild(eyeIcon);
      }
      
      const colText = document.createElement("span");
      colText.innerText = col;
      thContent.appendChild(colText);

      // Conditional formatting icon
      const colCondRules = this.getCondFormatRulesForColumn(col);
      if (colCondRules.length > 0) {
        const cfIcon = document.createElement("span");
        cfIcon.className = "lumina-condformat-icon";
        cfIcon.title = this.condFormatEdit ? "View or edit conditional formatting" : "View conditional formatting";
        cfIcon.innerText = "🎨";

        const dropdown = document.createElement("div");
        dropdown.className = "lumina-condformat-dropdown";
        dropdown.style.display = "none";

        const buildDropdown = () => {
          dropdown.innerHTML = "";
          const header = document.createElement("div");
          header.className = "lumina-condformat-header";
          header.innerHTML = `<strong>${col}</strong> formatting`;
          dropdown.appendChild(header);

          colCondRules.forEach((rule) => {
            const row = document.createElement("div");
            row.className = "lumina-condformat-row";

            const opSelect = document.createElement("select");
            ["eq","neq","gt","gte","lt","lte","between","contains","in"].forEach(opt => {
              const o = document.createElement("option");
              o.value = opt;
              o.textContent = opt;
              if ((rule.op || rule.operator || rule.rule || 'eq').toLowerCase() === opt) o.selected = true;
              opSelect.appendChild(o);
            });

            const valueInput = document.createElement("input");
            valueInput.type = "text";
            valueInput.placeholder = "value or a,b";
            if (rule.op === 'between' && Array.isArray(rule.range)) {
              valueInput.value = rule.range.join(',');
            } else if (rule.op === 'in' && Array.isArray(rule.values)) {
              valueInput.value = rule.values.join(',');
            } else if (rule.value !== undefined && rule.value !== null) {
              valueInput.value = rule.value;
            }

            const bgInput = document.createElement("input");
            bgInput.type = "text";
            bgInput.placeholder = "bg color";
            bgInput.value = rule.style?.bg || "";

            const colorInput = document.createElement("input");
            colorInput.type = "text";
            colorInput.placeholder = "text color";
            colorInput.value = rule.style?.color || "";

            const fwSelect = document.createElement("select");
            ["","normal","bold","600","700"].forEach(opt => {
              const o = document.createElement("option");
              o.value = opt;
              o.textContent = opt === "" ? "font weight" : opt;
              if ((rule.style?.fontWeight || "") === opt) o.selected = true;
              fwSelect.appendChild(o);
            });

            const applyChange = () => {
              rule.op = opSelect.value;
              if (rule.op === 'between') {
                const parts = valueInput.value.split(',').map(v => v.trim()).filter(v => v !== "");
                rule.range = parts.length === 2 ? [Number(parts[0]), Number(parts[1])] : undefined;
                rule.value = undefined;
                rule.values = undefined;
              } else if (rule.op === 'in') {
                const parts = valueInput.value.split(',').map(v => v.trim()).filter(v => v !== "");
                rule.values = parts;
                rule.value = undefined;
                rule.range = undefined;
              } else {
                rule.value = valueInput.value;
                rule.range = undefined;
                rule.values = undefined;
              }
              rule.style = rule.style || {};
              rule.style.bg = bgInput.value || undefined;
              rule.style.color = colorInput.value || undefined;
              rule.style.fontWeight = fwSelect.value || undefined;
              this.markCondFormatDirty();
              this.updateTableBody();
            };

            if (this.condFormatEdit) {
              [opSelect, valueInput, bgInput, colorInput, fwSelect].forEach(inputEl => {
                inputEl.onchange = applyChange;
              });
            } else {
              [opSelect, valueInput, bgInput, colorInput, fwSelect].forEach(el => el.disabled = true);
            }

            row.appendChild(opSelect);
            row.appendChild(valueInput);
            row.appendChild(bgInput);
            row.appendChild(colorInput);
            row.appendChild(fwSelect);
            dropdown.appendChild(row);
          });

          if (!this.condFormatEdit) {
            const note = document.createElement("div");
            note.className = "lumina-condformat-note";
            note.textContent = "Conditional formatting is view-only.";
            dropdown.appendChild(note);
          }
        };

        buildDropdown();

        cfIcon.onclick = (e) => {
          e.stopPropagation();
          if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
            this.activeCondFormatDropdown = null;
          } else {
            this.closeActiveCondFormatDropdown();
            dropdown.style.display = "block";
            this.activeCondFormatDropdown = dropdown;
          }
        };

        thContent.appendChild(cfIcon);
        th.appendChild(dropdown);
      }
      
      // Add sort indicator
      if (this.sortable) {
        const sortIcon = document.createElement("span");
        sortIcon.className = "lumina-sort-icon";
        
        // Check if this column is in the sort stack
        const sortIndex = this.state.sortColumns.findIndex(s => s.name === col);
        
        if (sortIndex !== -1) {
          // Active sort - show solid icon with priority number
          const sortCol = this.state.sortColumns[sortIndex];
          sortIcon.classList.add("lumina-sort-icon-active");
          const arrow = sortCol.asc ? "▲" : "▼";
          const priority = this.state.sortColumns.length > 1 ? (sortIndex + 1) : "";
          sortIcon.innerText = ` ${arrow}${priority}`;
        } else {
          // Inactive - show faded icon
          sortIcon.classList.add("lumina-sort-icon-inactive");
          sortIcon.innerHTML = " <span style='opacity: 0.3;'>⇅</span>";
        }
        
        thContent.appendChild(sortIcon);
      }
      
      th.appendChild(thContent);
      th.onclick = (e) => {
        const target = e.target;
        const inCondDropdown = target.closest('.lumina-condformat-dropdown');
        const onCondIcon = target.classList && target.classList.contains('lumina-condformat-icon');
        const isFormControl = ['INPUT','SELECT','TEXTAREA','OPTION','BUTTON'].includes(target.tagName);
        if (inCondDropdown || onCondIcon || isFormControl) return;
        this.sort(col);
      };
      th.setAttribute("tabindex", "0");
      th.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.sort(col);
          }
        }
      };
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    if (this.filtersEnabled) {
        const trFilter = document.createElement("tr");
        trFilter.className = "lumina-filter-row";
        this.columns.forEach((col, index) => {
            // Skip hidden columns
            if (!this.state.visibleColumns.includes(col)) return;
            
            const th = document.createElement("th");
            th.dataset.columnId = col;

            const filterWrapper = document.createElement('div');
            filterWrapper.className = 'lumina-filter-wrapper';

            const filterInput = document.createElement("input");
            filterInput.type = "text";
            filterInput.className = "lumina-filter-input";
            filterInput.placeholder = "Filter...";
            filterInput.value = this.state.columnFilters[col] || "";
            filterInput.oninput = (e) => this.updateColumnFilter(col, e.target.value);
            
            filterWrapper.appendChild(filterInput);

            if (this.state.columnFilters[col]) {
                const clearBtn = document.createElement("button");
                clearBtn.innerHTML = "&times;";
                clearBtn.className = "lumina-filter-clear";
                clearBtn.setAttribute("aria-label", `Clear filter for ${col}`);
                clearBtn.onclick = () => {
                    this.updateColumnFilter(col, "");
                };
                filterWrapper.appendChild(clearBtn);
            }

            th.appendChild(filterWrapper);
            trFilter.appendChild(th);
        });
        thead.appendChild(trFilter);
    }
    
    table.appendChild(thead);    // TBODY
    const tbody = document.createElement("tbody");
    
    // Pagination / virtualization logic
    let pageData;
    let start = 0;
    let end;
    let topSpacerPx = 0;
    let bottomSpacerPx = 0;
    const totalRows = this.state.filteredData.length;
    if (this.paginationEnabled && this.paginationScroller && this.virtualizationEnabled) {
      const rowH = this.getRowHeightPx();
      const containerHeight = this.refs.tableContainer ? this.refs.tableContainer.clientHeight || (this.paginationLimit * rowH) : this.paginationLimit * rowH;
      const scrollTop = this.refs.tableContainer ? this.refs.tableContainer.scrollTop : 0;
      const first = Math.max(0, Math.floor(scrollTop / rowH) - this.virtualizationBuffer);
      const visibleCount = Math.ceil(containerHeight / rowH) + (this.virtualizationBuffer * 2);
      const last = Math.min(totalRows, first + visibleCount);
      start = first;
      end = last;
      pageData = this.state.filteredData.slice(first, last);
      topSpacerPx = first * rowH;
      bottomSpacerPx = Math.max(0, (totalRows - last) * rowH);
    } else if (this.paginationEnabled && this.paginationScroller) {
      pageData = this.state.filteredData;
      start = 0;
      end = pageData.length;
    } else {
      // Regular pagination: show only current page
      start = (this.state.page - 1) * this.state.rowsPerPage;
      end = start + this.state.rowsPerPage;
      pageData = this.state.filteredData.slice(start, end);
    }

    if (pageData.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = this.state.visibleColumns.length;
      td.className = "lumina-notfound";
      td.innerText = this.state.searchTerm ? "No matching records found" : "No records found";
      td.setAttribute("role", "alert");
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      if (topSpacerPx > 0) {
        const spacerTop = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${topSpacerPx}px`;
        spacerTop.appendChild(spacerTd);
        tbody.appendChild(spacerTop);
      }
      pageData.forEach((rowData, pageIndex) => {
        const tr = document.createElement("tr");
        // Calculate index in filteredData using pageIndex and pagination offset
        const filteredIndex = pageIndex + start;
        const rowIndex = this.state.filteredRowIndices[filteredIndex];
        tr.setAttribute("data-row-index", rowIndex);

        if (this.selectionEnabled) {
          tr.style.cursor = "pointer";
          tr.onclick = (e) => this.handleRowClick(rowIndex, e);
        }

        if (this.state.selectedRows.has(rowIndex)) {
          tr.classList.add("lumina-selected");
        }

        rowData.forEach((cellData, index) => {
          const colName = this.columns[index];
          // Skip hidden columns
          if (!this.state.visibleColumns.includes(colName)) return;
          
          const td = document.createElement("td");
          if (this.layoutTextAlign) td.style.textAlign = this.layoutTextAlign;
          
          if (this.htmlCols.includes(colName)) {
            td.innerHTML = cellData;
          } else {
            let cellText = cellData;
            if (this.state.searchTerm && this.searchHighlight) {
              cellText = this.highlightText(cellText, this.state.searchTerm);
            }
            if (this.state.columnFilters[colName] && this.filtersHighlight) {
              cellText = this.highlightText(cellText, this.state.columnFilters[colName]);
            }
            td.innerHTML = cellText;
          }
          this.applyHeatmap(td, colName, cellData);
          this.applyConditionalFormatting(td, tr, colName, cellData);
          
          // Apply sorted column highlight if enabled - use border if heatmap/conditional formatting present
          const isSorted = this.sortHighlight && this.state.sortColumns.some(s => s.name === colName);
          if (isSorted) {
            const hasHeatmap = this.heatmapColumns && this.heatmapColumns[colName];
            const hasCondFormat = this.condFormatRules && this.condFormatRules.some(r => r && r.column === colName);
            if (hasHeatmap || hasCondFormat) {
              td.classList.add("lumina-sorted-column-border");
            } else {
              td.classList.add("lumina-sorted-column");
            }
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      if (bottomSpacerPx > 0) {
        const spacerBottom = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${bottomSpacerPx}px`;
        spacerBottom.appendChild(spacerTd);
        tbody.appendChild(spacerBottom);
      }
    }
    table.appendChild(tbody);
    this.refs.tableContainer.appendChild(table);

    // Apply scroller styling if enabled
    if (this.paginationEnabled && this.paginationScroller) {
      const rowH = this.getRowHeightPx();
      this.refs.tableContainer.style.maxHeight = (this.paginationLimit * rowH) + "px";
      this.refs.tableContainer.style.overflowY = "auto";
      this.bindVirtualScroll();
    } else {
      this.refs.tableContainer.style.maxHeight = "";
      this.refs.tableContainer.style.overflowY = "";
    }

    // Rebuild footer (only for regular pagination, not scroller)
    if (!this.refs.footer || (this.paginationEnabled && this.paginationScroller)) {
      // Scroller mode: show summary only
      if (this.paginationShowSummary && this.paginationScroller && this.refs.footer) {
        this.refs.footer.innerHTML = "";
        const summary = document.createElement("div");
        summary.className = "lumina-summary";
        const selectedCount = this.selectionEnabled ? this.state.selectedRows.size : 0;
        const selectedText = this.selectionEnabled && selectedCount > 0 ? ` <span style="color: #666;">(selected: ${selectedCount})</span>` : "";
        const hiddenCount = this.state.hiddenRows.size;
        const hiddenText = hiddenCount > 0 ? ` <span style="color: #ff6b6b;">(${hiddenCount} hidden)</span>` : "";
        const sortedText = this.state.sortColumns.length > 0 ? ` <span style="color: #666;">(sorted)</span>` : "";
        summary.innerHTML = `Showing <b>${this.state.filteredData.length}</b> results (scroll to view all)${selectedText}${hiddenText}${sortedText}`;
        summary.setAttribute("role", "status");
        summary.setAttribute("aria-live", "polite");
        this.refs.footer.appendChild(summary);
      }
      return;
    }
    
    this.refs.footer.innerHTML = "";
    const totalPages = Math.ceil(this.state.filteredData.length / this.state.rowsPerPage);
    
    const pages = document.createElement("div");
    pages.className = "lumina-pages";
    
    if (this.state.page > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "lumina-pagination-button lumina-pagination-button-prev";
      prevBtn.innerText = "Previous";
      prevBtn.setAttribute("aria-label", "Previous page");
      prevBtn.onclick = () => { this.state.page--; this.renderTable(); };
      pages.appendChild(prevBtn);
    }
    
    const pageStart = Math.max(1, this.state.page - 2);
    const pageEnd = Math.min(totalPages, this.state.page + 2);
    
    if (pageStart > 1) {
      const firstBtn = document.createElement("button");
      firstBtn.className = "lumina-pagination-button";
      firstBtn.innerText = "1";
      firstBtn.onclick = () => { this.state.page = 1; this.renderTable(); };
      pages.appendChild(firstBtn);
      
      if (pageStart > 2) {
        const dots = document.createElement("span");
        dots.className = "lumina-pagination-dots";
        dots.innerText = "...";
        pages.appendChild(dots);
      }
    }
    
    for (let i = pageStart; i <= pageEnd; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "lumina-pagination-button";
      if (i === this.state.page) {
        pageBtn.classList.add("lumina-pagination-button-current");
      }
      pageBtn.innerText = i;
      pageBtn.setAttribute("aria-label", `Page ${i}`);
      pageBtn.onclick = () => { this.state.page = i; this.renderTable(); };
      pages.appendChild(pageBtn);
    }
    
    if (pageEnd < totalPages) {
      if (pageEnd < totalPages - 1) {
        const dots = document.createElement("span");
        dots.className = "lumina-pagination-dots";
        dots.innerText = "...";
        pages.appendChild(dots);
      }
      
      const lastBtn = document.createElement("button");
      lastBtn.className = "lumina-pagination-button";
      lastBtn.innerText = totalPages;
      lastBtn.onclick = () => { this.state.page = totalPages; this.renderTable(); };
      pages.appendChild(lastBtn);
    }
    
    if (this.state.page < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "lumina-pagination-button lumina-pagination-button-next";
      nextBtn.innerText = "Next";
      nextBtn.setAttribute("aria-label", "Next page");
      nextBtn.onclick = () => { this.state.page++; this.renderTable(); };
      pages.appendChild(nextBtn);
    }
    this.refs.footer.appendChild(pages);

    if (this.paginationEnabled && !this.paginationScroller) {
        const limiterWrapper = document.createElement('div')
        limiterWrapper.className = 'lumina-pagination-limiter'
        const limitOptions = document.createElement("select");
        limitOptions.className = "lumina-pagination-limit";
        this.paginationLimitOptions.forEach(option => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.innerText = `${option} / page`;
          if (option === this.state.rowsPerPage) {
            opt.selected = true;
          }
          limitOptions.appendChild(opt);
        });
        limitOptions.onchange = (e) => this.handleLimitChange(e.target.value);
        limiterWrapper.appendChild(limitOptions)
        this.refs.footer.appendChild(limiterWrapper);
    }

    if (this.paginationShowSummary) {
        const summary = document.createElement("div");
        summary.className = "lumina-summary";
        const startRow = this.state.filteredData.length > 0 ? start + 1 : 0;
        const endRow = Math.min(end, this.state.filteredData.length);
        const selectedCount = this.selectionEnabled ? this.state.selectedRows.size : 0;
        const selectedText = this.selectionEnabled && selectedCount > 0 ? ` <span style="color: #666;">(selected: ${selectedCount})</span>` : "";
        const hiddenCount = this.state.hiddenRows.size;
        const hiddenText = hiddenCount > 0 ? ` <span style="color: #ff6b6b;">(${hiddenCount} hidden)</span>` : "";
        const sortedText = this.state.sortColumns.length > 0 ? ` <span style="color: #666;">(sorted)</span>` : "";
        summary.innerHTML = `Showing <b>${startRow}</b> to <b>${endRow}</b> of <b>${this.state.filteredData.length}</b> results${selectedText}${hiddenText}${sortedText}`;
        summary.setAttribute("role", "status");
        summary.setAttribute("aria-live", "polite");
        this.refs.footer.appendChild(summary);
    }
  }

  updateTableBody() {
    // Lightweight update: only rebuild tbody without touching header/footer
    const table = this.refs.tableContainer?.querySelector("table");
    if (!table) {
      // If table doesn't exist, fall back to full render
      return this.renderTable();
    }
    
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      return this.renderTable();
    }
    
    // Clear and rebuild tbody
    tbody.innerHTML = "";
    
    // Pagination / virtualization logic
    let pageData;
    let start = 0;
    let end;
    let topSpacerPx = 0;
    let bottomSpacerPx = 0;
    const totalRows = this.state.filteredData.length;
    if (this.paginationEnabled && this.paginationScroller && this.virtualizationEnabled) {
      const rowH = this.getRowHeightPx();
      const containerHeight = this.refs.tableContainer ? this.refs.tableContainer.clientHeight || (this.paginationLimit * rowH) : this.paginationLimit * rowH;
      const scrollTop = this.refs.tableContainer ? this.refs.tableContainer.scrollTop : 0;
      const first = Math.max(0, Math.floor(scrollTop / rowH) - this.virtualizationBuffer);
      const visibleCount = Math.ceil(containerHeight / rowH) + (this.virtualizationBuffer * 2);
      const last = Math.min(totalRows, first + visibleCount);
      start = first;
      end = last;
      pageData = this.state.filteredData.slice(first, last);
      topSpacerPx = first * rowH;
      bottomSpacerPx = Math.max(0, (totalRows - last) * rowH);
    } else if (this.paginationEnabled && this.paginationScroller) {
      start = 0;
      end = totalRows;
      pageData = this.state.filteredData;
    } else {
      start = (this.state.page - 1) * this.state.rowsPerPage;
      end = Math.min(start + this.state.rowsPerPage, totalRows);
      pageData = this.state.filteredData.slice(start, end);
    }

    if (pageData.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = this.state.visibleColumns.length;
      td.className = "lumina-notfound";
      td.innerText = this.state.searchTerm ? "No matching records found" : "No records found";
      td.setAttribute("role", "alert");
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      if (topSpacerPx > 0) {
        const spacerTop = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${topSpacerPx}px`;
        spacerTop.appendChild(spacerTd);
        tbody.appendChild(spacerTop);
      }
      pageData.forEach((rowData, pageIndex) => {
        const tr = document.createElement("tr");
        // Calculate index in filteredData using pageIndex and pagination offset
        const filteredIndex = pageIndex + start;
        const rowIndex = this.state.filteredRowIndices[filteredIndex];
        tr.setAttribute("data-row-index", rowIndex);

        if (this.selectionEnabled) {
          tr.style.cursor = "pointer";
          tr.onclick = (e) => this.handleRowClick(rowIndex, e);
        }

        if (this.state.selectedRows.has(rowIndex)) {
          tr.classList.add("lumina-selected");
        }

        rowData.forEach((cellData, index) => {
          const colName = this.columns[index];
          // Skip hidden columns
          if (!this.state.visibleColumns.includes(colName)) return;
          
          const td = document.createElement("td");
          if (this.layoutTextAlign) td.style.textAlign = this.layoutTextAlign;
          
          if (this.htmlCols.includes(colName)) {
            td.innerHTML = cellData;
          } else {
            let cellText = cellData;
            if (this.state.searchTerm && this.searchHighlight) {
              cellText = this.highlightText(cellText, this.state.searchTerm);
            }
            if (this.state.columnFilters[colName] && this.filtersHighlight) {
              cellText = this.highlightText(cellText, this.state.columnFilters[colName]);
            }
            td.innerHTML = cellText;
          }
          this.applyHeatmap(td, colName, cellData);
          this.applyConditionalFormatting(td, tr, colName, cellData);
          
          // Apply sorted column highlight if enabled - use border if heatmap/conditional formatting present
          const isSorted = this.sortHighlight && this.state.sortColumns.some(s => s.name === colName);
          if (isSorted) {
            const hasHeatmap = this.heatmapColumns && this.heatmapColumns[colName];
            const hasCondFormat = this.condFormatRules && this.condFormatRules.some(r => r && r.column === colName);
            if (hasHeatmap || hasCondFormat) {
              td.classList.add("lumina-sorted-column-border");
            } else {
              td.classList.add("lumina-sorted-column");
            }
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      if (bottomSpacerPx > 0) {
        const spacerBottom = document.createElement("tr");
        const spacerTd = document.createElement("td");
        spacerTd.colSpan = this.state.visibleColumns.length;
        spacerTd.style.height = `${bottomSpacerPx}px`;
        spacerBottom.appendChild(spacerTd);
        tbody.appendChild(spacerBottom);
      }
    }
  }

  toggleFullscreen() {
    this.state.isFullscreen = !this.state.isFullscreen;
    const wrapper = this.refs.wrapper;
    
    if (this.state.isFullscreen) {
      // Enter fullscreen
      wrapper.classList.add("lumina-fullscreen");
      document.body.style.overflow = "hidden";
    } else {
      // Exit fullscreen
      wrapper.classList.remove("lumina-fullscreen");
      document.body.style.overflow = "";
    }
    
    // Update button icon and title without full re-render
    const expandBtn = wrapper.querySelector(".lumina-expand-button");
    if (expandBtn) {
      expandBtn.innerHTML = this.state.isFullscreen ? "⤓" : "⤢";
      expandBtn.title = this.state.isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen";
      expandBtn.setAttribute("aria-label", this.state.isFullscreen ? "Exit fullscreen" : "Expand to fullscreen");
    }
  }

  toggleMinimize() {
    if (!this.refs.wrapper || !this.refs.tableContainer) return;
    
    this.state.isMinimized = !this.state.isMinimized;
    const wrapper = this.refs.wrapper;
    const tableContainer = this.refs.tableContainer;
    const minimizeBtn = wrapper.querySelector(".lumina-minimize-button");
    
    if (this.state.isMinimized) {
      // Minimize: collapse the table body
      const targetHeight = tableContainer.scrollHeight;
      tableContainer.style.maxHeight = targetHeight + "px";
      tableContainer.style.overflow = "hidden";
      tableContainer.style.transition = "max-height 0.3s ease-out";
      
      // Force reflow
      tableContainer.offsetHeight;
      
      // Collapse to 0
      tableContainer.style.maxHeight = "0px";
    } else {
      // Expand: show the table body
      const table = tableContainer.querySelector("table");
      if (table) {
        const targetHeight = table.scrollHeight;
        tableContainer.style.maxHeight = targetHeight + "px";
        tableContainer.style.transition = "max-height 0.3s ease-in";
        
        // After animation, restore proper state
        setTimeout(() => {
          // If scroller mode is enabled, maintain the scroller height
          if (this.paginationEnabled && this.paginationScroller) {
            tableContainer.style.maxHeight = (this.paginationLimit * 40) + "px";
            tableContainer.style.overflowY = "auto";
          } else {
            // Otherwise, remove fixed height to allow dynamic resizing
            tableContainer.style.maxHeight = "";
            tableContainer.style.overflow = "";
          }
          tableContainer.style.transition = "";
        }, 300);
      }
    }
    
    // Update button icon and title
    if (minimizeBtn) {
      minimizeBtn.innerHTML = this.state.isMinimized ? "▼" : "▲";
      minimizeBtn.title = this.state.isMinimized ? "Expand Table" : "Minimize Table";
      minimizeBtn.setAttribute("aria-label", this.state.isMinimized ? "Expand table" : "Minimize table");
    }
  }
}


// Export for use in HTMLWidgets
if (typeof window !== 'undefined') {
  window.LuminaGrid = LuminaGrid;
}



