#' Create a Lumina Table
#'
#' @param data A data.frame or tibble
#' @param width CSS width
#' @param height CSS height
#' @param elementId Optional ID
#' @param maximizable Logical. Enable fullscreen expand button in top-right corner?
#' @param minimizable Logical. Enable minimize button to collapse table with smooth animation?
#' @param sortable Logical. Enable column sorting? Click once for ascending, twice for descending, three times to restore original order.
#' @param colHide Logical. Show eye icon on each column header to hide/show columns? Only works when column toggle dropdown is enabled via opt_buttons().
#' @param title Character. Optional title displayed above the table.
#' @param caption Character. Optional caption displayed below the table.
#'
#' @import htmlwidgets
#' @importFrom jsonlite toJSON
#' @export
lumina <- function(data, width = "100%", height = NULL, elementId = NULL, maximizable = TRUE, minimizable = TRUE, sortable = TRUE, colHide = FALSE, title = NULL, caption = NULL) {
  
  # 1. Extract Column Names (including the internal __rowIndex__ column)
  cols <- c(colnames(data), "__rowIndex__")
  
  # 2. Process Data for Grid.js
  # Ensure all NAs are empty strings so they don't show as "NA"
  data[is.na(data)] <- ""
  
  # --- THE FIX IS HERE ---
  # Convert dataframe to list of rows for JSON serialization
  # Each row should be an unnamed list of values with rowIndex appended
  data_list <- lapply(seq_len(nrow(data)), function(i) {
    row_values <- as.list(data[i, ])
    row_index <- i - 1  # JavaScript is 0-indexed
    # Create a list with all values + row index, then unname it
    row_with_index <- c(row_values, list(`__rowIndex__` = row_index))
    # Convert to vector-like list (unnamed) for proper JSON serialization
    unname(row_with_index)
  })
  # -----------------------
  
  # 3. Payload
  x <- list(
    data = data_list,
    columns = cols,
    config = list(
      theme = "default",
      html_cols = list(),
      search = list(enabled = TRUE, highlight = TRUE, position = "right"),
      selection = list(enabled = FALSE, mode = "single", reset = FALSE),
      filters = list(enabled = FALSE, highlight = TRUE),
      pagination = list(enabled = TRUE, limit = 10, limitOptions = c(10, 25, 50, 100), scroller = FALSE),
      maximizable = maximizable,
      minimizable = minimizable,
      sortable = sortable,
      colHide = colHide,
      title = title,
      caption = caption
    )
  )
  
  # 4. Create Widget
  widget <- htmlwidgets::createWidget(
    name = 'lumina',
    x = x,
    width = width,
    height = height,
    package = 'LuminaTable',
    elementId = elementId
  )
  
  # 5. Add XLSX library dependency for downloads
  widget$dependencies <- c(
    widget$dependencies,
    list(
      htmltools::htmlDependency(
        name = "xlsx",
        version = "0.18.5",
        src = c(href = "https://cdn.sheetjs.com"),
        script = "xlsx-0.18.5/package/dist/xlsx.full.min.js"
      )
    )
  )
  
  return(widget)
}