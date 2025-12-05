#' Add a Sparkline to a Column
#'
#' @param lumina_obj A lumina widget
#' @param col The column name containing numeric data
#' @param color The hex color for the bars
#' @importFrom htmlwidgets onRender
#' @export
add_sparkline <- function(lumina_obj, col, color = "#6200ea") {
  
  # We need to intercept the widget data before it sends to JS
  # But htmlwidgets are tricky to modify in-pipe if not designed for it.
  # For simplicity in this V1, we will assume the user passes a pre-processed 
  # dataframe OR we use a "Pre-Render" hook.
  
  # NOTE: To keep this simple for the tutorial, we will use a helper 
  # to generate the SVG string column *before* calling lumina(),
  # and this function just flags it.
  
  lumina_obj$x$config$html_cols <- c(lumina_obj$x$config$html_cols, col)
  return(lumina_obj)
}

#' Generate SVG Sparkline String
#' 
#' Helper function to convert numbers to HTML bars
#' @param x numeric vector
#' @export
spark_bar <- function(x, color = "#6200ea") {
  val <- as.numeric(x)
  if(is.na(val)) return("")
  
  # Normalize to 0-100%
  width <- paste0(val, "%")
  
  sprintf(
    "<div style='width: 100px; background: #eee; height: 12px; border-radius: 2px;'>
       <div style='width: %s; background: %s; height: 100%%; border-radius: 2px;'></div>
     </div>",
    width, color
  )
}