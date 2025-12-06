library(shiny)
library(LuminaTable)
library(dplyr)

# Create sample datasets
set.seed(123)

# Dataset 1: Sales data with sparklines
sales_data <- data.frame(
  Product = c("Laptop", "Mouse", "Keyboard", "Monitor", "Headset", 
              "Tablet", "Phone", "Speaker", "Webcam", "Microphone"),
  Category = c("Electronics", "Accessories", "Accessories", "Electronics", "Accessories",
               "Electronics", "Electronics", "Accessories", "Accessories", "Accessories"),
  Price = c(999, 25, 75, 450, 120, 599, 799, 85, 95, 65),
  Stock = c(45, 150, 89, 32, 78, 23, 67, 41, 55, 92),
  Rating = c(4.5, 4.2, 4.7, 4.3, 4.6, 4.4, 4.8, 3.9, 4.1, 4.0),
  Sales = c(85, 45, 92, 38, 67, 55, 78, 41, 49, 33),
  stringsAsFactors = FALSE
)

# Dataset 2: Employee data
employee_data <- data.frame(
  ID = 1:20,
  Name = c("Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eve Davis",
           "Frank Miller", "Grace Wilson", "Henry Moore", "Ivy Taylor", "Jack Anderson",
           "Kelly Thomas", "Leo Jackson", "Mary White", "Nathan Harris", "Olivia Martin",
           "Paul Thompson", "Quinn Garcia", "Rachel Martinez", "Sam Robinson", "Tina Clark"),
  Department = rep(c("Sales", "Engineering", "Marketing", "HR"), 5),
  Salary = round(runif(20, 45000, 120000), -2),
  Years = sample(1:15, 20, replace = TRUE),
  Status = sample(c("Active", "On Leave", "Remote"), 20, replace = TRUE),
  stringsAsFactors = FALSE
)

# Dataset 3: XSS test data
xss_data <- data.frame(
  ID = 1:5,
  Name = c("Normal Text", "<b>Bold Tag</b>", "<script>alert('XSS')</script>", 
           "Text with 'quotes' and \"double quotes\"", "Special chars: < > & \" '"),
  Description = c("Regular description", "Contains <em>emphasis</em>", 
                  "Dangerous: <img src=x onerror=alert('XSS')>",
                  "Ampersand & less than < greater than >", "All safe now!"),
  stringsAsFactors = FALSE
)

ui <- fluidPage(
  tags$head(
    tags$style(HTML("
      body { background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .container-fluid { max-width: 1400px; margin: 0 auto; }
      h2 { color: #333; margin-top: 30px; margin-bottom: 20px; border-bottom: 2px solid #6200ea; padding-bottom: 10px; }
      h3 { color: #555; margin-top: 25px; margin-bottom: 15px; }
      .test-section { background: white; padding: 20px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .control-panel { background: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px; border: 1px solid #ddd; }
      .shiny-input-container { margin-bottom: 10px; }
      label { font-weight: 600; color: #555; }
    "))
  ),
  
  titlePanel(
    div(
      h1("LuminaTable Comprehensive Test Suite", style = "color: #6200ea; margin-bottom: 10px;"),
      p("Testing all features: Search, Filters, Pagination, Selection, Themes, Sparklines, and Column Toggle", 
        style = "color: #666; font-size: 16px;")
    )
  ),
  
  # Test 1: Basic Table with All Default Features
  div(class = "test-section",
    h2("1. Basic Table - Default Configuration"),
    p("Default pagination (10 rows), search enabled, no filters"),
    luminaOutput("table1")
  ),
  
  # Test 2: Search and Filters
  div(class = "test-section",
    h2("2. Search with Column Filters"),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("search_enabled", "Enable Global Search", TRUE),
      checkboxInput("search_highlight", "Highlight Search Results", TRUE),
      selectInput("search_position", "Search Position:", 
                  choices = c("right", "left", "top", "bottom"), selected = "top"),
      checkboxInput("filters_enabled", "Enable Column Filters", TRUE),
      checkboxInput("filters_highlight", "Highlight Filter Results", TRUE)
    ),
    luminaOutput("table2")
  ),
  
  # Test 3: Pagination Options
  div(class = "test-section",
    h2("3. Pagination and Scroller Modes"),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("pagination_enabled", "Enable Pagination", TRUE),
      numericInput("page_size", "Page Size:", value = 5, min = 3, max = 20),
      checkboxInput("use_scroller", "Use Scroller Mode (instead of pagination)", FALSE),
      checkboxInput("show_summary", "Show Results Summary", TRUE)
    ),
    luminaOutput("table3")
  ),
  
  # Test 4: Row Selection
  div(class = "test-section",
    h2("4. Row Selection"),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("selection_enabled", "Enable Selection", TRUE),
      radioButtons("selection_mode", "Selection Mode:", 
                   choices = c("single", "multiple"), selected = "multiple", inline = TRUE),
      checkboxInput("selection_reset", "Show Reset Button", TRUE)
    ),
    luminaOutput("table4"),
    h4("Selected Rows:", style = "margin-top: 20px;"),
    verbatimTextOutput("selected_output")
  ),
  
  # Test 5: Themes
  div(class = "test-section",
    h2("5. Theme Gallery"),
    div(class = "control-panel",
      h4("Select Theme:"),
      selectInput("theme_select", NULL,
                  choices = c("default", "midnight", "corporate", "cyber", "simple", "sunset", "auto"),
                  selected = "default")
    ),
    luminaOutput("table5")
  ),
  
  # Test 6: Sparklines and HTML Content
  div(class = "test-section",
    h2("6. Sparklines and HTML Rendering"),
    p("Sales column shows sparkline bars generated with add_sparkline()"),
    luminaOutput("table6")
  ),
  
  # Test 7: Column Toggle Buttons
  div(class = "test-section",
    h2("7. Column Visibility Toggle"),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("buttons_enabled", "Enable Column Toggle", TRUE),
      radioButtons("buttons_position", "Button Bar Position:", 
                   choices = c("top", "bottom"), selected = "top", inline = TRUE),
      checkboxGroupInput("visible_cols", "Default Visible Columns:",
                        choices = names(employee_data),
                        selected = names(employee_data))
    ),
    luminaOutput("table7")
  ),
  
  # Test 8: XSS Security Test
  div(class = "test-section",
    h2("8. Security Test - XSS Prevention"),
    p("This table contains HTML tags and script injection attempts. All should be safely escaped."),
    div(style = "background: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 15px; border-radius: 5px;",
      strong("⚠️ Test:"), " HTML tags like <b>, <script>, and special characters should appear as text, not execute."
    ),
    luminaOutput("table8")
  ),
  
  # Test 8.5: Layout Options - Enhanced
  div(class = "test-section",
    h2("8.5. Layout Customization with opt_layout()"),
    p("Comprehensive test of all layout options. Adjust controls to see visual changes in real-time."),
    div(class = "control-panel",
      h4("Visual Effects:"),
      fluidRow(
        column(3, checkboxInput("layout_striped", "Striped Rows", TRUE)),
        column(3, checkboxInput("layout_bordered", "Bordered Cells", FALSE)),
        column(3, checkboxInput("layout_compact", "Compact Spacing", FALSE)),
        column(3, checkboxInput("layout_hover", "Hover Effect (Shadow)", TRUE))
      ),
      h4("Shadow & Borders:"),
      fluidRow(
        column(3, checkboxInput("layout_shadow", "Table Shadow", FALSE)),
        column(3, selectInput("layout_shadow_size", "Shadow Size:", 
                    choices = c("small", "medium", "large"), selected = "medium")),
        column(3, selectInput("layout_border_style", "Border Style:", 
                    choices = c("solid", "dashed", "dotted"), selected = "solid")),
        column(3, numericInput("layout_corner_radius", "Corner Radius (px):", 
                    value = 8, min = 0, max = 20, step = 2))
      ),
      h4("Typography & Spacing:"),
      fluidRow(
        column(3, numericInput("layout_font_size", "Font Size (pt):", 
                    value = 11, min = 8, max = 16, step = 1)),
        column(3, numericInput("layout_row_height", "Row Height (px):", 
                    value = 40, min = 25, max = 60, step = 5)),
        column(3, numericInput("layout_header_height", "Header Height (px):", 
                    value = 45, min = 30, max = 70, step = 5)),
        column(3, numericInput("layout_cell_padding", "Cell Padding (px):", 
                    value = 12, min = 4, max = 24, step = 2))
      ),
      h4("Alignment & Text:"),
      fluidRow(
        column(3, selectInput("layout_text_align", "Text Align:", 
                    choices = c("left", "center", "right"), selected = "left")),
        column(3, selectInput("layout_header_align", "Header Align:", 
                    choices = c("left", "center", "right"), selected = "left")),
        column(3, selectInput("layout_vertical_align", "Vertical Align:", 
                    choices = c("top", "middle", "bottom"), selected = "middle")),
        column(3, checkboxInput("layout_wrap_text", "Wrap Text", FALSE))
      ),
      h4("Header Styling:"),
      fluidRow(
        column(3, textInput("layout_header_bg", "Header Background:", value = "")),
        column(3, textInput("layout_header_color", "Header Text Color:", value = "")),
        column(3, selectInput("layout_header_font_weight", "Header Font Weight:", 
                    choices = c("normal", "bold", "600", "700"), selected = "bold")),
        column(3, numericInput("layout_header_font_size", "Header Font Size (pt):", 
                    value = 11, min = 8, max = 18, step = 1))
      ),
      h4("Sticky Headers & Animation:"),
      fluidRow(
        column(3, checkboxInput("layout_sticky_footer", "Sticky Footer", FALSE)),
        column(3, checkboxInput("layout_animation", "Enable Animations", TRUE)),
        column(3, numericInput("layout_animation_duration", "Animation Duration (ms):", 
                    value = 300, min = 0, max = 1000, step = 50)),
        column(3, p(em("Header always sticky"), style = "color: #666; margin-top: 8px;"))
      ),
      h4("Dimensions:"),
      fluidRow(
        column(4, textInput("layout_width", "Width:", value = "100%")),
        column(4, textInput("layout_height", "Height:", value = "auto")),
        column(4, numericInput("layout_max_height", "Max Height (px):", 
                    value = 600, min = 200, max = 1200, step = 50))
      )
    ),
    luminaOutput("table8_5")
  ),
  
  # Test 9: Fullscreen/Maximize/Minimize
  div(class = "test-section",
    h2("9. Fullscreen and Minimize Buttons"),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("maximizable_enabled", "Enable Expand Button", TRUE),
      checkboxInput("minimizable_enabled", "Enable Minimize Button", TRUE)
    ),
    p("Click the expand button (⤢) to enter fullscreen mode. Click the minimize button (▲) to collapse the table body with smooth animation."),
    p("Note: When minimized and you perform a search, the table will auto-expand. When you clear the search, it will restore the minimized state."),
    luminaOutput("table9")
  ),
  
  # Test 10: All Features Combined
  div(class = "test-section",
    h2("10. Kitchen Sink - All Features Enabled"),
    p("Search + Filters + Selection + Theme + Sparklines + Column Toggle (Dropdown + Eye Icons) + Downloads + Fullscreen + Minimize + Multi-Column Sorting"),
    p(strong("Multi-Column Sorting:"), " Click column headers to sort. Click multiple columns to add them to the sort priority (▲1, ▼2, etc.). The info bar shows '(sorted)' when active."),
    luminaOutput("table10")
  ),
  
  # Test 11: Conditional Formatting
  div(class = "test-section",
    h2("11. Conditional Formatting"),
    p("Demonstrates opt_condformat() with numeric and text rules. Adjust thresholds and colors, then tweak in-header edit mode."),
    div(class = "control-panel",
      h4("Controls:"),
      checkboxInput("condformat_enable", "Apply conditional formatting", TRUE),
      checkboxInput("condformat_edit", "Allow header editing", TRUE),
      fluidRow(
        column(3, checkboxInput("cond_use_price", "Enable Price rule", TRUE)),
        column(3, checkboxInput("cond_use_stock", "Enable Stock rule", TRUE)),
        column(3, checkboxInput("cond_use_rating", "Enable Rating rule", TRUE)),
        column(3, checkboxInput("cond_use_category", "Enable Category rule", TRUE))
      ),
      fluidRow(
        column(4, numericInput("cond_price_gt", "Price greater than:", value = 700, min = 0, max = 2000, step = 50)),
        column(4, textInput("cond_price_bg", "Price BG color:", value = "#fff3e0")),
        column(4, textInput("cond_price_color", "Price text color:", value = "#e65100"))
      ),
      fluidRow(
        column(4, numericInput("cond_stock_lt", "Stock less than:", value = 40, min = 0, max = 200, step = 5)),
        column(4, textInput("cond_stock_bg", "Stock BG color:", value = "#ffebee")),
        column(4, textInput("cond_stock_color", "Stock text color:", value = "#c62828"))
      ),
      fluidRow(
        column(4, numericInput("cond_rating_gte", "Rating at least:", value = 4.6, min = 0, max = 5, step = 0.1)),
        column(4, textInput("cond_rating_bg", "Rating BG color:", value = "#e8f5e9")),
        column(4, textInput("cond_rating_color", "Rating text color:", value = "#2e7d32"))
      ),
      fluidRow(
        column(6, selectInput("cond_category_value", "Category equals:", choices = unique(sales_data$Category), selected = "Accessories")),
        column(3, textInput("cond_category_bg", "Category BG color:", value = "#e3f2fd")),
        column(3, textInput("cond_category_color", "Category text color:", value = "#1565c0"))
      )
    ),
    luminaOutput("table11")
  ),

  # Test 12: Heatmap Preview
  div(class = "test-section",
    h2("12. Heatmap (opt_heatmap)"),
    p("Heatmap colors the numeric columns directly in the table using the configured palette."),
    div(class = "control-panel",
      h4("Heatmap Controls:"),
      checkboxInput("heatmap_enable", "Apply heatmap", TRUE),
      selectInput("heatmap_columns", "Columns to color:", multiple = TRUE,
                  choices = names(sales_data)[sapply(sales_data, is.numeric)],
                  selected = c("Price", "Stock", "Rating", "Sales")),
      radioButtons("heatmap_palette", "Palette:", inline = TRUE,
                   choices = c("Blues", "Greens", "Reds", "Viridis", "Custom"), selected = "Blues"),
      fluidRow(
        column(3, textInput("heatmap_color_low", "Custom low color:", value = "#f7fbff")),
        column(3, textInput("heatmap_color_high", "Custom high color:", value = "#08306b")),
        column(3, checkboxInput("heatmap_show_values", "Show Values in Cells", TRUE)),
        column(3, checkboxInput("heatmap_show_scale", "Show Scale Bar", FALSE))
      )
    ),
    luminaOutput("table12")
  ),
  
  br(), br()
)

server <- function(input, output, session) {
  
  # Test 1: Basic default table
  output$table1 <- renderLumina({
    lumina(sales_data, 
           title = "Sales Data Overview",
           caption = "Sample sales data with 10 products across multiple categories")
  })
  
  # Test 2: Search and Filters - Dynamic
  output$table2 <- renderLumina({
    lumina(employee_data,
           title = "Employee Directory",
           caption = "Use search and column filters to find specific employees") |>
      opt_search(
        show = input$search_enabled,
        highlight = input$search_highlight,
        position = input$search_position,
        filters = input$filters_enabled,
        filtersHighlight = input$filters_highlight
      )
  })
  
  # Test 3: Pagination - Dynamic
  output$table3 <- renderLumina({
    lumina(employee_data) |>
      opt_pagination(
        enabled = input$pagination_enabled,
        pageSize = input$page_size,
        pageSizeOptions = c(3, 5, 10, 20),
        scroller = input$use_scroller,
        showSummary = input$show_summary
      )
  })
  
  # Test 4: Row Selection - Dynamic
  output$table4 <- renderLumina({
    lumina(sales_data[, 1:6]) |>
      opt_selection(
        enabled = input$selection_enabled,
        mode = input$selection_mode,
        reset = input$selection_reset
      )
  })
  
  # Display selected rows
  output$selected_output <- renderPrint({
    input$table4_selected
  })
  
  # Test 5: Themes - Dynamic
  output$table5 <- renderLumina({
    lumina(sales_data[, 1:6],
           title = paste("Theme:", toupper(input$theme_select)),
           caption = "Title and caption styling adapts to each theme") |>
      set_theme(input$theme_select) |>
      opt_pagination(pageSize = 5)
  })
  
  # Test 6: Sparklines
  output$table6 <- renderLumina({
    lumina(sales_data,
           title = "Sales Performance with Sparklines",
           caption = "The Sales column displays inline bar charts") |>
      add_sparkline("Sales") |>
      opt_pagination(pageSize = 5)
  })
  
  # Test 7: Column Toggle - Dynamic
  output$table7 <- renderLumina({
    req(length(input$visible_cols) > 0)  # Require at least one column
    
    if (input$buttons_enabled) {
      lumina(employee_data) |>
        opt_buttons(
          columnView = list(
            enabled = TRUE,
            position = input$buttons_position,
            visibleColumns = input$visible_cols
          )
        ) |>
        opt_pagination(pageSize = 8)
    } else {
      lumina(employee_data) |>
        opt_pagination(pageSize = 8)
    }
  })
  
  # Test 8: XSS Security
  output$table8 <- renderLumina({
    lumina(xss_data,
           title = "Security Test: XSS Prevention",
           caption = "All HTML and script tags are properly escaped and displayed as text") |>
      opt_search(show = TRUE, highlight = TRUE, position = "top") |>
      opt_pagination(enabled = FALSE)
  })
  
  # Test 8.5: Layout Options - Enhanced Dynamic
  output$table8_5 <- renderLumina({
    lumina(employee_data,
           title = "Comprehensive Layout Evaluation",
           caption = "All opt_layout() parameters are active. Adjust controls to test each option.") |>
      opt_layout(
        width = input$layout_width,
        height = input$layout_height,
        maxHeight = paste0(input$layout_max_height, "px"),
        striped = input$layout_striped,
        bordered = input$layout_bordered,
        borderStyle = input$layout_border_style,
        compact = input$layout_compact,
        hover = input$layout_hover,
        fontSize = paste0(input$layout_font_size, "pt"),
        headerHeight = paste0(input$layout_header_height, "px"),
        rowHeight = paste0(input$layout_row_height, "px"),
        cellPadding = paste0(input$layout_cell_padding, "px"),
        cornerRadius = paste0(input$layout_corner_radius, "px"),
        shadow = input$layout_shadow,
        shadowSize = input$layout_shadow_size,
        footerSticky = input$layout_sticky_footer,
        wrapText = input$layout_wrap_text,
        textAlign = input$layout_text_align,
        headerAlign = input$layout_header_align,
        headerBgColor = if (input$layout_header_bg != "") input$layout_header_bg else NULL,
        headerColor = if (input$layout_header_color != "") input$layout_header_color else NULL,
        headerFontWeight = input$layout_header_font_weight,
        headerFontSize = paste0(input$layout_header_font_size, "pt"),
        verticalAlign = input$layout_vertical_align,
        animation = input$layout_animation,
        animationDuration = paste0(input$layout_animation_duration, "ms")
      ) |>
      opt_pagination(pageSize = 8)
  })
  
  # Test 9: Fullscreen/Maximize/Minimize - Dynamic
  output$table9 <- renderLumina({
    lumina(employee_data, 
           title = "Fullscreen & Minimize Controls",
           caption = "Test expand/collapse functionality with search interaction",
           maximizable = input$maximizable_enabled, 
           minimizable = input$minimizable_enabled,
           sortable = TRUE) |>
      opt_search(show = TRUE, highlight = TRUE, position = "top") |>
      opt_pagination(pageSize = 8) |>
      opt_layout(striped = TRUE, hover = TRUE)
  })
  
  # Test 10: Kitchen Sink - All features
  output$table10 <- renderLumina({
    lumina(sales_data, 
           maximizable = TRUE,
           minimizable = TRUE,
           sortable = TRUE,
           colHide = TRUE,
           title = "Complete Feature Demonstration",
           caption = "All LuminaTable features: multi-column sorting (click multiple headers for priority), search, filters, selection, themes, sparklines, column toggle (dropdown + eye icons), downloads (CSV/JSON/XLSX), fullscreen, minimize, and layout customization") |>
      set_theme("midnight") |>
      opt_search(show = TRUE, highlight = TRUE, position = "top", 
                filters = TRUE, filtersHighlight = TRUE) |>
      opt_pagination(enabled = TRUE, pageSize = 5, pageSizeOptions = c(5, 10, 25), scroller = FALSE, showSummary = TRUE) |>
      opt_selection(enabled = TRUE, mode = "multiple", reset = TRUE) |>
      opt_buttons(
        columnView = list(
          enabled = TRUE,
          position = "top",
          visibleColumns = c("Product", "Category", "Price", "Stock", "Rating", "Sales")
        ),
        downloads = list(
          enabled = TRUE,
          filename = "sales-data",
          formats = c("csv", "json", "xlsx")
        )
      ) |>
      add_sparkline("Sales") |>
      opt_layout(
        striped = TRUE,
        bordered = FALSE,
        compact = FALSE,
        hover = TRUE,
        fontSize = "11pt",
        rowHeight = "40px",
        cellPadding = "12px",
        cornerRadius = "8px",
        shadow = FALSE,
        shadowSize = "medium",
        headerSticky = TRUE,
        wrapText = FALSE,
        textAlign = "left",
        verticalAlign = "middle",
        animation = TRUE,
        animationDuration = "300ms"
      )
  })

  cond_rules <- reactive({
    rules <- list()
    if (isTRUE(input$cond_use_price)) {
      rules <- c(rules, list(
        list(
          column = "Price",
          op = "gt",
          value = input$cond_price_gt,
          style = list(bg = input$cond_price_bg, color = input$cond_price_color, fontWeight = "bold")
        )
      ))
    }
    if (isTRUE(input$cond_use_stock)) {
      rules <- c(rules, list(
        list(
          column = "Stock",
          op = "lt",
          value = input$cond_stock_lt,
          style = list(bg = input$cond_stock_bg, color = input$cond_stock_color)
        )
      ))
    }
    if (isTRUE(input$cond_use_rating)) {
      rules <- c(rules, list(
        list(
          column = "Rating",
          op = "gte",
          value = input$cond_rating_gte,
          style = list(bg = input$cond_rating_bg, color = input$cond_rating_color, fontWeight = "bold")
        )
      ))
    }
    if (isTRUE(input$cond_use_category)) {
      rules <- c(rules, list(
        list(
          column = "Category",
          op = "eq",
          value = input$cond_category_value,
          style = list(bg = input$cond_category_bg, color = input$cond_category_color)
        )
      ))
    }
    rules
  })

  # Test 11: Conditional Formatting
  output$table11 <- renderLumina({
    tbl <- lumina(sales_data,
                  title = "Conditional Formatting Demo",
                  caption = "Rules highlight Price, Stock, Rating, and Category columns")

    if (isTRUE(input$condformat_enable)) {
      tbl <- opt_condformat(
        tbl, 
        rules = cond_rules(), 
        edit = isTRUE(input$condformat_edit)
      )
    }

    tbl |> opt_pagination(pageSize = 5)
  })

  # Test 12: Heatmap demo
  output$table12 <- renderLumina({
    numeric_cols <- names(sales_data)[sapply(sales_data, is.numeric)]
    selected_cols <- input$heatmap_columns
    if (length(selected_cols) == 0) {
      selected_cols <- numeric_cols
    }

    palette <- switch(input$heatmap_palette,
                      "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                      "Reds"   = c("#fff5f0", "#fb6a4a", "#67000d"),
                      "Viridis"= c("#440154", "#21908C", "#FDE725"),
                      "Custom" = c(input$heatmap_color_low, input$heatmap_color_high),
                      c("#f7fbff", "#6baed6", "#08306b"))

    tbl <- lumina(sales_data,
                  title = "Heatmap Preview with opt_heatmap",
                  caption = "Heatmap uses numeric columns; hover to see values")

    if (isTRUE(input$heatmap_enable) && length(selected_cols) > 0) {
      tbl <- tbl |>
        opt_heatmap(
          columns = selected_cols, 
          palette = palette,
          showValues = isTRUE(input$heatmap_show_values),
          showScale = isTRUE(input$heatmap_show_scale)
        )
    }

    tbl |>
      opt_performance(debounceSearchMs = 0, disableAnimations = TRUE, preferScroller = TRUE) |>
      opt_pagination(pageSize = 6, scroller = TRUE)
  })
}

shinyApp(ui = ui, server = server)
