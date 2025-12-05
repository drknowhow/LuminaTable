# LuminaTable

Beautiful, interactive tables for R and Shiny, powered by a lightweight custom renderer (LuminaEngine). Build Excel-inspired tables with search, filters, sorting, pagination or scrolling, downloads, sparklines, conditional formatting, and performance-minded virtualization.

## Installation

Use `remotes`/`devtools` to install from GitHub:

```r
install.packages("remotes")
remotes::install_github("drknowhow/LuminaTable")
```

For local development (from this repo):

```r
source("install_package.R")  # builds, documents, installs from source
```

## Quick start

```r
library(LuminaTable)

lumina(iris) |>
	opt_search(filters = TRUE) |>
	opt_pagination(scroller = TRUE, showSummary = TRUE) |>
	opt_buttons(
		columnView = list(enabled = TRUE, position = "top"),
		downloads  = list(enabled = TRUE, formats = c("csv", "json", "xlsx"))
	) |>
	opt_layout(compact = TRUE, fontSize = "13px")
```

## Feature highlights

- Search + per-column filters with optional text highlighting
- Sorting, pagination or scroll mode with sticky headers/footers
- Column visibility toggle and download buttons (csv/json/xlsx)
- Row selection with reset, hide/unhide, and Shiny output binding
- Conditional formatting rules (cell or row) plus inline heatmaps
- Sparklines (lines/bars) for compact visuals inside cells
- Performance options: debounced inputs, animation toggle, scroller preference, virtualization windowing, and server-side short-circuits

## Shiny usage

```r
library(shiny)
library(LuminaTable)

ui <- fluidPage(
	luminaOutput("tbl", height = "500px")
)

server <- function(input, output, session) {
	output$tbl <- renderLumina(
		lumina(mtcars) |>
			opt_search(filters = TRUE) |>
			opt_selection(enabled = TRUE, mode = "multiple", reset = TRUE) |>
			opt_pagination(scroller = TRUE)
	)
}

shinyApp(ui, server)
```

## Heatmaps and conditional formatting

```r
lumina(mtcars) |>
	opt_heatmap(columns = c("mpg", "hp"), palette = c("#f7fbff", "#6baed6", "#08306b")) |>
	opt_condformat(
		list(column = "mpg", op = "gt", value = 25, target = "row",
				 style = list(bg = "#fff3e0", fontWeight = "bold"))
	)
```

## Performance tuning

```r
lumina(mtcars) |>
	opt_performance(
		debounceSearchMs   = 150,
		debounceFiltersMs  = 150,
		disableAnimations  = TRUE,
		preferScroller     = TRUE,
		virtualization     = TRUE,
		virtualizationBuffer = 8,
		serverSide         = FALSE  # set TRUE when data is pre-filtered server-side
	)
```

## Run the demo app

From the repo root:

```r
shiny::runApp('.', host = '127.0.0.1', port = 8000)
```

## License

MIT License (see `LICENSE`).
