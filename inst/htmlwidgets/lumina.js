HTMLWidgets.widget({
  name: 'lumina',
  type: 'output',

  factory: function(el, width, height) {
    return {
      renderValue: function(x) {
        // Extract configuration
        var searchConf = x.config.search || { 
            enabled: true, 
            highlight: true, 
            position: 'right' 
        };
        var theme = x.config.theme || 'default';
        var selectionConf = x.config.selection || { 
            enabled: false, 
            mode: 'single',
            reset: false
        };
        var filtersConf = x.config.filters || { 
            enabled: false,
            highlight: true
        };
        var condformatConf = x.config.condformat || { rules: [], edit: false };
        var performanceConf = x.config.performance || {};
        var heatmapConf = x.config.heatmap || null;
        var paginationConf = x.config.pagination || {
            enabled: true,
            limit: 10,
            limitOptions: [10, 25, 50, 100],
            scroller: false,
            showSummary: true
        };
        var buttonsConf = x.config.buttons || {
            enabled: false,
            columnView: {
                enabled: true,
                position: 'top',
                visibleColumns: x.columns
            },
            downloads: {
                enabled: false,
                filename: null,
                formats: ['csv', 'json']
            }
        };
        
        // Ensure columnView structure exists for backward compatibility
        if (buttonsConf.enabled && !buttonsConf.columnView) {
            buttonsConf.columnView = {
                enabled: buttonsConf.columnToggle !== false,
                position: buttonsConf.position || 'top',
                visibleColumns: buttonsConf.visibleColumns || x.columns
            };
        }
        
        // Ensure downloads structure exists
        if (buttonsConf.enabled && !buttonsConf.downloads) {
            buttonsConf.downloads = {
                enabled: false,
                filename: null,
                formats: ['csv', 'json']
            };
        }
        
        var maximizable = x.config.maximizable !== false;
        var minimizable = x.config.minimizable !== false;
        var sortable = x.config.sortable !== false;
        var colHide = x.config.colHide === true;
        var title = x.config.title || null;
        var caption = x.config.caption || null;
        
        // Apply Theme Classes to the Main Container first
        el.classList.add("lumina");
        
        // Remove old theme classes before applying new one
        var themeClasses = ["default", "midnight", "corporate", "cyber", "simple", "sunset", "auto"];
        themeClasses.forEach(function(t) {
            el.classList.remove("lumina-" + t);
        });
        
        if (theme && theme !== 'default') {
            el.classList.add("lumina-" + theme);
        }
        
        // Apply Search Position/Visibility Classes
        if (searchConf.enabled === false) {
            el.classList.add("lumina-search-hidden");
        } else {
            el.classList.add("lumina-search-" + searchConf.position);
        }
        
        // Apply No Highlight Class if needed
        if (searchConf.highlight === false) {
            el.classList.add("lumina-no-highlight");
        }
        
        // Initialize our Custom Engine
        el.lumina = new LuminaGrid({
            container: el,
            initialClasses: el.className, // Pass classes to the engine
            data: x.data,
            columns: x.columns,
            htmlCols: x.config.html_cols || [],
            searchEnabled: searchConf.enabled,
            searchHighlight: searchConf.highlight,
            selectionEnabled: selectionConf.enabled,
            selectionMode: selectionConf.mode,
            selectionReset: selectionConf.reset,
            filtersEnabled: filtersConf.enabled,
            filtersHighlight: filtersConf.highlight,
            paginationEnabled: paginationConf.enabled,
            paginationLimit: paginationConf.limit,
            paginationLimitOptions: paginationConf.limitOptions,
            paginationScroller: paginationConf.scroller,
            paginationShowSummary: paginationConf.showSummary,
            buttonsEnabled: buttonsConf.enabled,
            buttonsColumnView: buttonsConf.columnView,
            buttonsDownloads: buttonsConf.downloads,
            maximizable: maximizable,
            minimizable: minimizable,
            sortable: sortable,
            colHide: colHide,
            title: title,
            caption: caption,
            layout: x.config.layout || {},
            performance: performanceConf,
            heatmap: heatmapConf,
                        condFormatRules: condformatConf.rules || [],
                        condFormatEdit: condformatConf.edit === true,
            elementId: el.id
        });
      },

      resize: function(width, height) {
        // Optional: Handle resize logic
      }
    };
  }
});

if (HTMLWidgets.shinyMode) {
  Shiny.addCustomMessageHandler("lumina-reset-selection", function(message) {
    var el = document.getElementById(message.id);
    if (el && el.lumina) {
      el.lumina.clearSelection();
    }
  });
}