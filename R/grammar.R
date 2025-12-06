#' Configure Search and Filters
#'
#' @param w A lumina widget
#' @param show Logical. Show or hide the global search bar?
#' @param highlight Logical. Highlight matched text in search results?
#' @param position Character. Position of search bar: "left", "right", "top", or "bottom".
#' @param filters Logical. Enable or disable per-column filters?
#' @param filtersHighlight Logical. Highlight matched text in column filter results?
#' @export
opt_search <- function(w, show = TRUE, highlight = TRUE, position = "right", filters = FALSE, filtersHighlight = TRUE) {
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  w$x$config$search <- list(
    enabled = show,
    highlight = highlight,
    position = position
  )
  
  w$x$config$filters <- list(
    enabled = filters,
    highlight = filtersHighlight
  )
  
  return(w)
}

#' Configure Column Filters (Deprecated - use opt_search instead)
#'
#' @param w A lumina widget
#' @param enabled Logical. Enable or disable column filters.
#' @param highlight Logical. Highlight matched text in search results?
#' @export
opt_filters <- function(w, enabled = TRUE, highlight = TRUE) {
  warning("opt_filters() is deprecated. Use opt_search(filters = TRUE, filtersHighlight = ...) instead.")
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  w$x$config$filters <- list(
    enabled = enabled,
    highlight = highlight
  )
  
  return(w)
}

#' Set Table Theme
#'
#' @param w A lumina widget
#' @param theme Name of the theme
#' @export
set_theme <- function(w, theme = "default") {
  w$x$config$theme <- theme
  return(w)
}

#' Configure Row Selection
#'
#' @param w A lumina widget
#' @param enabled Logical. Enable or disable row selection.
#' @param mode Character. Selection mode: "single" or "multiple".
#' @param reset Logical. Show a reset button?
#' @export
opt_selection <- function(w, enabled = TRUE, mode = "single", reset = FALSE) {
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  w$x$config$selection <- list(
    enabled = enabled,
    mode = mode,
    reset = reset
  )
  
  return(w)
}

#' Configure Pagination
#'
#' @param w A lumina widget
#' @param enabled Logical. Enable or disable pagination.
#' @param pageSize Numeric. The number of rows per page.
#' @param pageSizeOptions Numeric vector. The options for the rows per page dropdown.
#' @param scroller Logical. Use a scroller instead of pagination?
#' @param showSummary Logical. Show or hide the "Showing X to Y of Z results" text.
#' @export
opt_pagination <- function(w, enabled = TRUE, pageSize = 10, pageSizeOptions = c(10, 25, 50, 100), scroller = FALSE, showSummary = TRUE) {
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  w$x$config$pagination <- list(
    enabled = enabled,
    limit = pageSize,
    limitOptions = pageSizeOptions,
    scroller = scroller,
    showSummary = showSummary
  )
  
  return(w)
}

#' Configure Action Buttons
#'
#' Configure button features such as column visibility toggle and data downloads.
#' Accepts a list-based structure for flexible configuration.
#'
#' @param w A lumina widget
#' @param ... Named lists defining button configurations:
#'   \itemize{
#'     \item \code{columnView}: List with \code{enabled}, \code{position}, \code{visibleColumns}
#'     \item \code{downloads}: List with \code{enabled}, \code{filename}, \code{formats} (csv, json, xlsx)
#'   }
#' @examples
#' \dontrun{
#' lumina(mtcars) |>
#'   opt_buttons(
#'     columnView = list(enabled = TRUE, position = "top"),
#'     downloads = list(enabled = TRUE, filename = "data", formats = c("csv", "json", "xlsx"))
#'   )
#' }
#' @export
opt_buttons <- function(w, ...) {
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  # Get the arguments as a list
  args <- list(...)
  
  # Check if old-style arguments are being used (for backward compatibility)
  arg_names <- names(args)
  if (any(c("position", "columnToggle", "visibleColumns") %in% arg_names)) {
    # Old style: convert to new structure
    position <- if("position" %in% arg_names) args$position else "top"
    columnToggle <- if("columnToggle" %in% arg_names) args$columnToggle else TRUE
    visibleColumns <- if("visibleColumns" %in% arg_names) args$visibleColumns else NULL
    
    # If visibleColumns is NULL, default to all columns
    if(is.null(visibleColumns)) {
      visibleColumns <- w$x$columns
    }
    
    w$x$config$buttons <- list(
      enabled = TRUE,
      columnView = list(
        enabled = columnToggle,
        position = position,
        visibleColumns = visibleColumns
      )
    )
  } else {
    # New style: accept list structure
    button_config <- list(enabled = TRUE)
    
    # Process columnView if provided
    if ("columnView" %in% arg_names) {
      cv <- args$columnView
      if (is.null(cv$visibleColumns)) {
        cv$visibleColumns <- w$x$columns
      }
      if (is.null(cv$position)) {
        cv$position <- "top"
      }
      if (is.null(cv$enabled)) {
        cv$enabled <- TRUE
      }
      button_config$columnView <- cv
    }
    
    # Process downloads if provided
    if ("downloads" %in% arg_names) {
      dl <- args$downloads
      if (is.null(dl$enabled)) {
        dl$enabled <- TRUE
      }
      if (is.null(dl$filename)) {
        dl$filename <- NULL  # Will use timestamp-table in JS
      }
      if (is.null(dl$formats)) {
        dl$formats <- c("csv", "json", "xlsx")
      }
      button_config$downloads <- dl
    }
    
    w$x$config$buttons <- button_config
  }
  
  return(w)
}

#' Configure Conditional Formatting
#'
#' Define conditional formatting rules that are evaluated in the browser.
#' Each rule targets a column and applies a style when the condition is met.
#'
#' @param w A lumina widget
#' @param ... Rule definitions as lists. Each rule can include:
#'   \itemize{
#'     \item \code{column}: Column name to target (required)
#'     \item \code{op}: Comparison operator. One of \code{"gt"}, \code{"gte"}, \code{"lt"}, \code{"lte"}, \code{"eq"}, \code{"neq"}, \code{"between"}, \code{"contains"}, \code{"in"}. Default: \code{"eq"}.
#'     \item \code{value}: Single value for comparisons (numeric or character). For \code{between}, use \code{range} or a length-2 vector. For \code{in}, use \code{values}.
#'     \item \code{range}: Length-2 numeric vector for the \code{between} operator.
#'     \item \code{values}: Vector of values for the \code{in} operator.
#'     \item \code{target}: \code{"cell"} (default) or \code{"row"} to apply styles to the entire row.
#'     \item \code{style}: List of CSS styles, e.g. \code{list(bg="#fff3e0", color="#e65100", fontWeight="bold", textDecoration="underline", border="1px solid #e0e0e0", class="my-custom-class")}.
#'   }
#' @param rules Optional list of rules (useful when you already have them assembled). If omitted, rules are built from \code{...}.
#' @export
opt_condformat <- function(w, ..., rules = NULL, edit = FALSE) {
  if (is.null(w$x$config)) w$x$config <- list()

  if (is.null(rules)) {
    rules <- list(...)
  }

  if (!is.list(rules)) {
    stop("opt_condformat(): `rules` must be a list of rule definitions.")
  }

  w$x$config$condformat <- list(
    rules = rules,
    edit = isTRUE(edit)
  )

  return(w)
}

#' Apply a heatmap to table cells
#'
#' Colors specified numeric columns using a low→high gradient. The heatmap is applied directly to the table cells.
#'
#' @param w A lumina widget
#' @param columns Character vector of column names to heatmap. Must be numeric in the data.
#' @param palette Character vector of 2-5 hex colors used for a linear gradient (low → high).
#' @param showValues Logical. Show numeric values in cells (TRUE) or hide content and show only color (FALSE). Default: TRUE.
#' @param showScale Logical. Add a color scale bar in the table footer showing the gradient mapping. Default: FALSE.
#' @export
opt_heatmap <- function(w, columns, palette = c("#f7fbff", "#6baed6", "#08306b"), showValues = TRUE, showScale = FALSE) {
  if (is.null(w$x$config)) w$x$config <- list()

  if (missing(columns) || length(columns) == 0) {
    stop("opt_heatmap(): `columns` is required and must contain at least one column name.")
  }

  w$x$config$heatmap <- list(
    columns = as.character(columns),
    palette = as.character(palette),
    showValues = isTRUE(showValues),
    showScale = isTRUE(showScale)
  )

  return(w)
}

#' Configure Table Layout and Appearance
#'
#' Control various layout aspects of the table including dimensions, spacing, borders, and visual styling.
#'
#' @param w A lumina widget
#' @param width Character. CSS width of the table container (e.g., "100\%", "800px", "auto"). Default: NULL (uses widget width).
#' @param height Character. CSS height of the table container (e.g., "500px", "auto"). Default: NULL.
#' @param maxHeight Character. Maximum height before scrolling (e.g., "600px"). Default: NULL.
#' @param striped Logical. Enable alternating row colors (zebra striping). Default: TRUE.
#' @param bordered Logical. Show borders around cells. Default: TRUE.
#' @param borderStyle Character. Border style: "solid", "none", "light", "heavy". Default: "solid".
#' @param compact Logical. Use compact spacing (reduced padding). Default: FALSE.
#' @param hover Logical. Highlight rows on hover. Default: TRUE.
#' @param fontSize Character. Base font size (e.g., "14px", "0.9rem", "small", "medium", "large"). Default: NULL (theme default).
#' @param headerHeight Character. Height of header row (e.g., "45px", "auto"). Default: NULL (theme default).
#' @param rowHeight Character. Height of data rows (e.g., "40px", "auto"). Default: NULL (theme default).
#' @param cellPadding Character. Padding inside cells (e.g., "8px", "0.5rem"). Default: NULL (theme default).
#' @param cornerRadius Character. Border radius for rounded corners (e.g., "8px", "0"). Default: NULL (theme default).
#' @param shadow Logical. Add shadow effect to table container. Default: FALSE.
#' @param shadowSize Character. Shadow size: "none", "small", "medium", "large". Default: "medium".
#' @param headerSticky Logical. Make header row sticky during scroll. Default: TRUE.
#' @param footerSticky Logical. Make footer (pagination) sticky during scroll. Default: FALSE.
#' @param wrapText Logical. Wrap text in cells instead of truncating. Default: TRUE.
#' @param textAlign Character. Default text alignment: "left", "center", "right". Default: "left".
#' @param headerAlign Character. Header text alignment: "left", "center", "right". Default: NULL (inherits from textAlign).
#' @param headerBgColor Character. Header background color (e.g., "#f0f0f0", "lightgray"). Default: NULL (theme default).
#' @param headerColor Character. Header text color (e.g., "#333333", "darkblue"). Default: NULL (theme default).
#' @param headerFontWeight Character. Header font weight: "normal", "bold", "600", "700". Default: NULL (theme default).
#' @param headerFontSize Character. Header font size (e.g., "13px", "12pt"). Default: NULL (theme default).
#' @param verticalAlign Character. Vertical alignment: "top", "middle", "bottom". Default: "middle".
#' @param animation Logical. Enable smooth animations for interactions. Default: TRUE.
#' @param animationDuration Character. Duration of animations (e.g., "0.3s", "200ms"). Default: "0.3s".
#'
#' @examples
#' \dontrun{
#' lumina(mtcars) |>
#'   opt_layout(
#'     striped = TRUE,
#'     compact = TRUE,
#'     fontSize = "13px",
#'     cornerRadius = "12px",
#'     shadow = TRUE,
#'     headerBgColor = "#e8e8e8",
#'     headerColor = "#333",
#'     headerFontWeight = "bold"
#'   )
#'   
#' # Minimal layout
#' lumina(iris) |>
#'   opt_layout(
#'     bordered = FALSE,
#'     striped = FALSE,
#'     shadow = FALSE,
#'     borderStyle = "none"
#'   )
#'   
#' # Dense data layout with custom header
#' lumina(mtcars) |>
#'   opt_layout(
#'     compact = TRUE,
#'     fontSize = "12px",
#'     rowHeight = "32px",
#'     cellPadding = "4px",
#'     headerAlign = "center",
#'     headerFontSize = "13px",
#'     headerFontWeight = "bold"
#'   )
#' }
#' @export
opt_layout <- function(w, 
                       width = NULL,
                       height = NULL,
                       maxHeight = NULL,
                       striped = TRUE,
                       bordered = TRUE,
                       borderStyle = "solid",
                       compact = FALSE,
                       hover = TRUE,
                       fontSize = NULL,
                       headerHeight = NULL,
                       rowHeight = NULL,
                       cellPadding = NULL,
                       cornerRadius = NULL,
                       shadow = FALSE,
                       shadowSize = "medium",
                       headerSticky = TRUE,
                       footerSticky = FALSE,
                       wrapText = TRUE,
                       textAlign = "left",
                       headerAlign = NULL,
                       headerBgColor = NULL,
                       headerColor = NULL,
                       headerFontWeight = NULL,
                       headerFontSize = NULL,
                       verticalAlign = "middle",
                       animation = TRUE,
                       animationDuration = "0.3s") {
  
  # Ensure the config list structure exists
  if(is.null(w$x$config)) w$x$config <- list()
  
  # Build layout configuration
  layout_config <- list(
    width = width,
    height = height,
    maxHeight = maxHeight,
    striped = striped,
    bordered = bordered,
    borderStyle = borderStyle,
    compact = compact,
    hover = hover,
    fontSize = fontSize,
    headerHeight = headerHeight,
    rowHeight = rowHeight,
    cellPadding = cellPadding,
    cornerRadius = cornerRadius,
    shadow = shadow,
    shadowSize = shadowSize,
    headerSticky = headerSticky,
    footerSticky = footerSticky,
    wrapText = wrapText,
    textAlign = textAlign,
    headerAlign = headerAlign,
    headerBgColor = headerBgColor,
    headerColor = headerColor,
    headerFontWeight = headerFontWeight,
    headerFontSize = headerFontSize,
    verticalAlign = verticalAlign,
    animation = animation,
    animationDuration = animationDuration
  )
  
  # Remove NULL values to use defaults, preserving names
  layout_config <- layout_config[!sapply(layout_config, is.null)]
  
  w$x$config$layout <- layout_config
  
  return(w)
}

#' Performance tuning options
#'
#' Configure client-side performance tweaks such as debounced search and animation disable.
#'
#' @param w A lumina widget
#' @param debounceSearchMs Numeric. Milliseconds to debounce search input (0 to disable). Default 150ms.
#' @param debounceFiltersMs Numeric. Milliseconds to debounce column filter inputs (0 to disable). Default 150ms.
#' @param disableAnimations Logical. Disable row/transition animations for large tables. Default FALSE.
#' @param preferScroller Logical. Prefer scroller mode over paged mode when pagination is enabled. Default FALSE.
#' @param virtualization Logical. Enable row windowing/virtualization when scroller mode is on. Default FALSE.
#' @param virtualizationBuffer Integer. Extra rows to render above/below viewport when virtualization is on. Default 8.
#' @param serverSide Logical. Assume paging/search/filtering are handled server-side; skip client processing. Default FALSE.
#' @param disableHtml Logical. Treat all columns as plain text (ignore htmlCols) to reduce DOM cost. Default FALSE.
#' @param disableHighlight Logical. Disable search/filter highlighting to save render time. Default FALSE.
#' @export
opt_performance <- function(w,
                            debounceSearchMs = 150,
                            debounceFiltersMs = 150,
                            disableAnimations = FALSE,
                            preferScroller = FALSE,
                            virtualization = FALSE,
                            virtualizationBuffer = 8,
                            serverSide = FALSE,
                            disableHtml = FALSE,
                            disableHighlight = FALSE) {
  if (is.null(w$x$config)) w$x$config <- list()

  w$x$config$performance <- list(
    debounceSearchMs = debounceSearchMs,
    debounceFiltersMs = debounceFiltersMs,
    disableAnimations = isTRUE(disableAnimations),
    preferScroller = isTRUE(preferScroller),
    virtualization = isTRUE(virtualization),
    virtualizationBuffer = as.integer(virtualizationBuffer),
    serverSide = isTRUE(serverSide),
    disableHtml = isTRUE(disableHtml),
    disableHighlight = isTRUE(disableHighlight)
  )

  return(w)
}