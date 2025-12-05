#' Lumina Table Output for Shiny
#'
#' @param outputId Output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a lumina table
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name lumina-shiny
#'
#' @export
luminaOutput <- function(outputId, width = "100%", height = "auto"){
  htmlwidgets::shinyWidgetOutput(outputId, "lumina", width, height, package = "LuminaTable")
}

#' @rdname lumina-shiny
#' @export
renderLumina <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, luminaOutput, env, quoted = TRUE)
}
