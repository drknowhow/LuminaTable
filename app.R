# LuminaTable demonstration app showcasing the major features
library(shiny)
library(LuminaTable)
library(dplyr)

set.seed(123)

# Base dataset with search/filters, selection, pagination, downloads, and column toggles
basic_cars <- cbind(Model = rownames(mtcars), mtcars)
rownames(basic_cars) <- NULL
basic_cars$Cylinders <- paste0(basic_cars$cyl, " cyl")
basic_cars$Efficiency <- round(basic_cars$mpg / max(basic_cars$mpg) * 100, 1)
basic_cars <- basic_cars[, c("Model", "Cylinders", "mpg", "hp", "wt", "gear", "Efficiency")]

# Formatting demo data (heatmap + conditional formatting)
format_df <- iris
format_df$Petal.Ratio <- round(format_df$Petal.Length / format_df$Petal.Width, 2)

# Editable data with validations and dropdowns
edit_df <- data.frame(
  Name = c("Avery Lee", "Jordan Cruz", "Casey Patel", "Morgan Blake", "Quinn Chen"),
  Role = c("Analyst", "Engineer", "Manager", "Designer", "Engineer"),
  StartDate = c("2024-02-12", "2023-11-03", "2022-08-15", "2024-04-01", "2023-06-20"),
  Hours = c(38, 42, 36, 40, 34),
  Remote = c(TRUE, FALSE, TRUE, TRUE, FALSE),
  Email = c(
    "avery@example.com", "jordan@example.com", "casey@example.com",
    "morgan@example.com", "quinn@example.com"
  ),
  Status = c("Active", "Active", "Leave", "Active", "Contract"),
  stringsAsFactors = FALSE
)

# Sparklines / HTML column demo
spark_df <- data.frame(
  Project = paste("Project", LETTERS[1:8]),
  Region = rep(c("North", "South", "East", "West"), each = 2),
  Quality = sample(80:99, 8, replace = TRUE),
  OnTime = sample(55:100, 8, replace = TRUE),
  stringsAsFactors = FALSE
)
spark_df$OnTimeBar <- vapply(spark_df$OnTime, spark_bar, character(1), color = "#1b9e77")

# Performance / virtualization demo
perf_df <- data.frame(
  Row = 1:2000,
  Segment = sample(c("A", "B", "C", "D"), 2000, replace = TRUE),
  Score = round(runif(2000, 50, 100), 1),
  Visits = sample(10:500, 2000, replace = TRUE),
  Updated = format(as.Date("2024-01-01") + sample(0:180, 2000, replace = TRUE)),
  stringsAsFactors = FALSE
)

ui <- fluidPage(
  titlePanel("LuminaTable: feature overview"),
  tabsetPanel(
    tabPanel(
      "Basics",
      br(),
      p("Search + filters, selection, pagination, downloads, column toggles, and layout options."),
      luminaOutput("basic_tbl", height = "520px")
    ),
    tabPanel(
      "Formatting",
      br(),
      p("Heatmaps and conditional formatting applied to numeric and categorical columns."),
      luminaOutput("format_tbl", height = "520px")
    ),
    tabPanel(
      "Editing",
      br(),
      p("Editable cells with validation, dropdowns, header editing, and row add/delete."),
      luminaOutput("edit_tbl", height = "520px")
    ),
    tabPanel(
      "Sparklines",
      br(),
      p("HTML-enabled spark bars inside cells plus standard controls."),
      luminaOutput("spark_tbl", height = "480px")
    ),
    tabPanel(
      "Performance",
      br(),
      p("Large dataset with scroller mode, virtualization, and debounced inputs."),
      luminaOutput("perf_tbl", height = "600px")
    )
  )
)

server <- function(input, output, session) {
  output$basic_tbl <- renderLumina({
    lumina(
      basic_cars,
      title = "MTCARS controls",
      caption = "Search, filters, selection, pagination, downloads, column hide",
      colHide = TRUE,
      maximizable = TRUE,
      minimizable = TRUE,
      sortHighlight = TRUE
    ) |>
      opt_search(show = TRUE, highlight = TRUE, position = "top", filters = TRUE, filtersHighlight = TRUE) |>
      opt_selection(enabled = TRUE, mode = "multiple", reset = TRUE) |>
      opt_buttons(
        columnView = list(enabled = TRUE, position = "top", visibleColumns = colnames(basic_cars)),
        downloads = list(enabled = TRUE, filename = "lumina-basic", formats = c("csv", "json", "xlsx"))
      ) |>
      opt_pagination(enabled = TRUE, pageSize = 8, pageSizeOptions = c(5, 10, 20, 50), scroller = FALSE, showSummary = TRUE) |>
      opt_layout(
        striped = TRUE,
        hover = TRUE,
        shadow = TRUE,
        shadowSize = "medium",
        headerBgColor = "#f4f6fb",
        headerColor = "#1f2933",
        headerFontWeight = "600",
        cornerRadius = "12px",
        animation = TRUE,
        animationDuration = "0.25s"
      ) |>
      set_theme("default")
  })

  output$format_tbl <- renderLumina({
    lumina(
      format_df,
      title = "Heatmap + conditional formatting",
      caption = "Gradient coloring plus rule-based styles"
    ) |>
      opt_heatmap(
        columns = c("Sepal.Length", "Petal.Length", "Petal.Ratio"),
        palette = c("#edf8fb", "#b2e2e2", "#238b45"),
        showValues = TRUE,
        showScale = TRUE,
        individualized = FALSE
      ) |>
      opt_condformat(
        list(column = "Petal.Length", op = "gt", value = 5, target = "cell",
             style = list(bg = "#ffebee", color = "#b71c1c", fontWeight = "700")),
        list(column = "Species", op = "eq", value = "virginica", target = "row",
             style = list(bg = "#f7fbe8")),
        list(column = "Sepal.Width", op = "lt", value = 3, target = "cell",
             style = list(bg = "#fff3e0"))
      ) |>
      opt_layout(
        compact = TRUE,
        striped = TRUE,
        hover = TRUE,
        headerBgColor = "#0f172a",
        headerColor = "#ffffff",
        headerFontWeight = "600",
        cornerRadius = "10px",
        textAlign = "left"
      )
  })

  output$edit_tbl <- renderLumina({
    lumina(
      edit_df,
      title = "Editing + validation",
      caption = "Try editing cells; add/delete rows or rename columns",
      colHide = TRUE
    ) |>
      opt_edit(
        columns = list(
          edit_col("Name", type = "text", maxLength = 30),
          edit_col("Role", choices = c("Analyst", "Engineer", "Manager", "Designer"), allowNewChoices = TRUE),
          edit_col("StartDate", type = "date"),
          edit_col("Hours", type = "integer", min = 20, max = 60),
          edit_col("Remote", type = "logical"),
          edit_col("Email", type = "email", required = TRUE),
          edit_col("Status", choices = c("Active", "Leave", "Contract", "Onboarding"))
        ),
        rows = TRUE,
        add = "rows",
        delete = "rows",
        headerEdit = TRUE,
        trackChanges = TRUE
      ) |>
      opt_buttons(downloads = list(enabled = TRUE, filename = "lumina-edits", formats = c("csv", "json", "xlsx"))) |>
      opt_layout(
        compact = TRUE,
        hover = TRUE,
        fontSize = "13px",
        rowHeight = "38px",
        headerBgColor = "#f9fafb",
        headerFontWeight = "600",
        cornerRadius = "10px",
        animation = TRUE
      )
  })

  output$spark_tbl <- renderLumina({
    lumina(
      spark_df,
      title = "Sparklines / HTML cells",
      caption = "spark_bar() values flagged with add_sparkline()"
    ) |>
      add_sparkline("OnTimeBar", color = "#1b9e77") |>
      opt_search(show = TRUE, highlight = TRUE, position = "top", filters = TRUE) |>
      opt_buttons(
        columnView = list(enabled = TRUE, position = "top"),
        downloads = list(enabled = TRUE, filename = "lumina-sparklines", formats = c("csv", "json", "xlsx"))
      ) |>
      opt_pagination(pageSize = 6, pageSizeOptions = c(4, 6, 10), scroller = FALSE) |>
      opt_layout(
        compact = TRUE,
        hover = TRUE,
        cellPadding = "10px",
        headerBgColor = "#111827",
        headerColor = "#e5e7eb",
        headerFontWeight = "600",
        cornerRadius = "10px",
        shadow = TRUE,
        shadowSize = "small"
      )
  })

  output$perf_tbl <- renderLumina({
    lumina(
      perf_df,
      title = "Performance + virtualization (2,000 rows)",
      caption = "Scroller mode with debounced search/filters",
      minimizable = TRUE,
      maximizable = TRUE
    ) |>
      opt_search(show = TRUE, highlight = FALSE, position = "top", filters = TRUE, filtersHighlight = FALSE) |>
      opt_pagination(enabled = TRUE, pageSize = 25, pageSizeOptions = c(25, 50, 100, 200), scroller = TRUE, showSummary = FALSE) |>
      opt_performance(
        debounceSearchMs = 100,
        debounceFiltersMs = 100,
        disableAnimations = TRUE,
        preferScroller = TRUE,
        virtualization = TRUE,
        virtualizationBuffer = 12,
        serverSide = FALSE,
        disableHtml = FALSE,
        disableHighlight = TRUE
      ) |>
      opt_layout(
        height = "550px",
        headerSticky = TRUE,
        footerSticky = TRUE,
        striped = TRUE,
        hover = TRUE,
        borderStyle = "light",
        animation = FALSE
      )
  })
}

shinyApp(ui, server)
