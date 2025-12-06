library(shiny)
library(LuminaTable)
library(dplyr)

# Create comprehensive test datasets
set.seed(42)

# Dataset 1: Sales performance data with multiple numeric columns
sales_data <- data.frame(
  Product = c("Laptop", "Mouse", "Keyboard", "Monitor", "Headset", 
              "Tablet", "Phone", "Speaker", "Webcam", "Microphone"),
  Category = c("Electronics", "Accessories", "Accessories", "Electronics", "Accessories",
               "Electronics", "Electronics", "Accessories", "Accessories", "Accessories"),
  Q1_Sales = c(1200, 450, 680, 920, 540, 1100, 1450, 320, 280, 190),
  Q2_Sales = c(1450, 520, 720, 1050, 620, 1250, 1580, 380, 310, 220),
  Q3_Sales = c(1680, 590, 750, 980, 700, 1150, 1720, 410, 350, 240),
  Q4_Sales = c(2100, 720, 890, 1200, 850, 1450, 2050, 550, 420, 310),
  Price = c(999, 25, 75, 450, 120, 599, 799, 85, 95, 65),
  Stock = c(45, 150, 89, 32, 78, 23, 67, 41, 55, 92),
  Rating = c(4.5, 4.2, 4.7, 4.3, 4.6, 4.4, 4.8, 3.9, 4.1, 4.0),
  Profit_Margin = c(28.5, 42.3, 38.7, 31.2, 36.8, 25.4, 22.1, 45.6, 40.2, 43.8),
  stringsAsFactors = FALSE
)

# Dataset 2: Employee performance metrics
employee_data <- data.frame(
  Name = c("Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Eve Davis",
           "Frank Miller", "Grace Wilson", "Henry Moore", "Ivy Taylor", "Jack Anderson"),
  Department = c("Sales", "Engineering", "Marketing", "Sales", "Engineering",
                 "Marketing", "Sales", "Engineering", "Marketing", "Sales"),
  Base_Salary = c(60000, 85000, 70000, 65000, 90000, 75000, 68000, 95000, 72000, 70000),
  Bonus = c(8000, 12000, 9000, 7500, 14000, 10000, 8500, 15000, 9500, 9000),
  Performance_Score = c(4.2, 4.7, 4.0, 4.5, 4.8, 4.3, 4.1, 4.9, 4.4, 4.6),
  Years_Employed = c(5, 8, 3, 6, 10, 4, 7, 12, 5, 4),
  Projects_Completed = c(12, 28, 8, 15, 35, 11, 14, 42, 10, 13),
  Satisfaction_Score = c(3.8, 4.5, 3.9, 4.2, 4.6, 4.0, 4.1, 4.8, 4.3, 4.4),
  stringsAsFactors = FALSE
)

# Dataset 3: Weather data with many numeric columns
weather_data <- data.frame(
  Month = c("January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"),
  Avg_Temp = c(32, 35, 45, 58, 68, 78, 85, 83, 75, 63, 50, 38),
  Max_Temp = c(45, 48, 62, 75, 85, 95, 100, 98, 92, 80, 65, 52),
  Min_Temp = c(18, 22, 28, 42, 52, 62, 70, 68, 58, 45, 35, 25),
  Humidity = c(45, 42, 48, 55, 62, 68, 70, 72, 65, 58, 52, 46),
  Precipitation = c(2.1, 2.3, 3.2, 3.8, 4.2, 3.5, 2.8, 3.0, 3.5, 3.2, 2.8, 2.4),
  Wind_Speed = c(12, 14, 15, 12, 10, 9, 8, 9, 11, 13, 14, 13),
  Pressure = c(30.1, 30.0, 29.9, 29.8, 29.7, 29.6, 29.5, 29.6, 29.8, 30.0, 30.1, 30.2),
  Sunshine_Hours = c(120, 130, 150, 180, 210, 240, 280, 270, 240, 200, 140, 110),
  stringsAsFactors = FALSE
)

ui <- fluidPage(
  tags$head(
    tags$style(HTML("
      body { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        min-height: 100vh;
        padding: 20px 0;
      }
      .container-fluid { 
        max-width: 1600px; 
        margin: 0 auto; 
      }
      .main-title {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        margin-bottom: 30px;
        text-align: center;
      }
      .main-title h1 {
        color: #667eea;
        margin: 0;
        font-size: 32px;
      }
      .main-title p {
        color: #666;
        margin: 10px 0 0 0;
        font-size: 14px;
      }
      h2 { 
        color: white; 
        margin-top: 0; 
        margin-bottom: 15px; 
        font-size: 22px;
      }
      h3 { 
        color: white; 
        margin-top: 15px; 
        margin-bottom: 10px; 
        font-size: 16px;
      }
      h4 {
        color: #333;
        margin-bottom: 10px;
        font-weight: 700;
      }
      .test-section { 
        background: white; 
        padding: 25px; 
        margin-bottom: 25px; 
        border-radius: 8px; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      .control-panel { 
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 15px; 
        margin-bottom: 20px; 
        border-radius: 5px; 
        border-left: 4px solid #667eea;
      }
      .shiny-input-container { 
        margin-bottom: 10px; 
      }
      label { 
        font-weight: 600; 
        color: #333; 
      }
      .info-box {
        background: #e8f4f8;
        border-left: 4px solid #00a8cc;
        padding: 12px 15px;
        margin-bottom: 15px;
        border-radius: 3px;
        font-size: 13px;
        color: #333;
      }
      .feature-description {
        background: #f0f0f0;
        padding: 10px 15px;
        border-radius: 3px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #555;
        font-style: italic;
      }
      .palette-demo {
        display: inline-flex;
        height: 30px;
        border-radius: 3px;
        overflow: hidden;
        margin-right: 10px;
        vertical-align: middle;
        border: 1px solid #ccc;
      }
    "))
  ),
  
  div(class = "main-title",
    h1("LuminaTable Heatmap Comprehensive Evaluation"),
    p("Complete testing of heatmap functionality with various configurations, datasets, and color palettes")
  ),
  
  div(class = "test-section",
    h2("Test 1: Single Column Heatmap"),
    div(class = "feature-description",
      "Tests heatmap applied to a single numeric column with basic styling."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(4, selectInput("test1_palette", "Color Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis", "Custom"), 
                            selected = "Blues")),
        column(4, checkboxInput("test1_show_values", "Show Values in Cells", TRUE)),
        column(4, checkboxInput("test1_show_scale", "Show Scale Bar", TRUE))
      )
    ),
    div(class = "info-box",
      "This test applies a heatmap to only the 'Price' column. Verify that the color gradient is properly applied and the scale bar (if enabled) appears below the table aligned to the Price column."
    ),
    luminaOutput("table1")
  ),
  
  div(class = "test-section",
    h2("📊 Test 2: Multiple Column Heatmap"),
    div(class = "feature-description",
      "Tests heatmap applied to multiple numeric columns simultaneously."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(3, selectInput("test2_palette", "Color Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis", "Custom"), 
                            selected = "Greens")),
        column(3, checkboxInput("test2_show_values", "Show Values in Cells", TRUE)),
        column(3, checkboxInput("test2_show_scale", "Show Scale Bar", TRUE)),
        column(3, checkboxInput("test2_enable", "Enable Heatmap", TRUE))
      ),
      fluidRow(
        column(4, h4("Selected Columns:", style = "margin-top: 15px;")),
        column(8, checkboxGroupInput("test2_columns", NULL,
                                    choices = c("Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"),
                                    selected = c("Q1_Sales", "Q2_Sales")))
      )
    ),
    div(class = "info-box",
      "📌 This test applies a heatmap to the quarterly sales columns. Each column should get its own scale bar showing individual min/max/median values. Compare how colors normalize per-column."
    ),
    luminaOutput("table2")
  ),
  
  div(class = "test-section",
    h2("📊 Test 3: Hide Values (Color-Only Mode)"),
    div(class = "feature-description",
      "Tests heatmap with showValues=FALSE to display only colors without numeric content."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(4, selectInput("test3_palette", "Color Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis", "Custom"), 
                            selected = "Viridis")),
        column(4, numericInput("test3_columns_count", "Number of Columns to Show:", value = 3, min = 1, max = 8)),
        column(4, checkboxInput("test3_show_scale", "Show Scale Bar", TRUE))
      )
    ),
    div(class = "info-box",
      "📌 This test hides the numeric values and shows only the color gradient. Hover over cells to see the values in a tooltip (if implemented). The scale bar should still be visible with statistics."
    ),
    luminaOutput("table3")
  ),
  
  div(class = "test-section",
    h2("📊 Test 4: Employee Data - Multiple Metrics"),
    div(class = "feature-description",
      "Tests heatmap on diverse employee performance metrics with different scales."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(3, selectInput("test4_palette", "Color Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis", "Custom"), 
                            selected = "Greens")),
        column(3, checkboxInput("test4_show_values", "Show Values", TRUE)),
        column(3, checkboxInput("test4_show_scale", "Show Scale", TRUE)),
        column(3, checkboxInput("test4_enable", "Enable Heatmap", TRUE))
      ),
      checkboxGroupInput("test4_columns", "Columns to Highlight:",
                        choices = c("Base_Salary", "Bonus", "Performance_Score", 
                                   "Years_Employed", "Projects_Completed", "Satisfaction_Score"),
                        selected = c("Base_Salary", "Performance_Score"))
    ),
    div(class = "info-box",
      "📌 This test shows heatmap on completely different metrics (salary in dollars, scores 0-5, years 0-12, etc.). Verify each column normalizes its own min/max range independently."
    ),
    luminaOutput("table4")
  ),
  
  div(class = "test-section",
    h2("📊 Test 5: Weather Data - Comprehensive Heatmap"),
    div(class = "feature-description",
      "Tests heatmap on seasonal weather data with 8 numeric columns."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(2, selectInput("test5_palette", "Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis", "Custom"), 
                            selected = "Blues")),
        column(2, checkboxInput("test5_show_values", "Values", TRUE)),
        column(2, checkboxInput("test5_show_scale", "Scale", TRUE)),
        column(2, checkboxInput("test5_enable", "Heatmap", TRUE)),
        column(2, checkboxInput("test5_condensed", "Compact Mode", FALSE)),
        column(2, numericInput("test5_page_size", "Page Size:", value = 12, min = 6, max = 12))
      ),
      checkboxGroupInput("test5_columns", "Columns to Include:",
                        choices = c("Avg_Temp", "Humidity", "Precipitation", "Wind_Speed", 
                                   "Pressure", "Sunshine_Hours"),
                        selected = c("Avg_Temp", "Humidity", "Precipitation"))
    ),
    div(class = "info-box",
      "📌 This comprehensive test displays seasonal weather trends. All selected columns should show their respective heatmaps aligned in the scale footer. Observe how temperature, humidity, and precipitation correlate visually."
    ),
    luminaOutput("table5")
  ),
  
  div(class = "test-section",
    h2("📊 Test 6: Custom Color Palettes"),
    div(class = "feature-description",
      "Tests custom color palettes with user-defined gradient colors."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(3, textInput("test6_color_low", "Low Value Color:", value = "#ffeda0")),
        column(3, textInput("test6_color_high", "High Value Color:", value = "#f03b20")),
        column(3, checkboxInput("test6_show_values", "Show Values", TRUE)),
        column(3, checkboxInput("test6_show_scale", "Show Scale", TRUE))
      ),
      fluidRow(
        column(6, h4("Color Preview:")),
        column(6, uiOutput("test6_palette_preview"))
      )
    ),
    div(class = "info-box",
      "📌 Enter any valid hex color codes to create custom gradients. The gradient bar in the scale footer should show the transition between your selected colors."
    ),
    luminaOutput("table6")
  ),
  
  div(class = "test-section",
    h2("📊 Test 7: Scale Bar Statistics Verification"),
    div(class = "feature-description",
      "Detailed test to verify scale bar displays correct min/max/median calculations."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(4, selectInput("test7_column", "Column to Analyze:", 
                            choices = c("Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"), 
                            selected = "Q3_Sales")),
        column(4, selectInput("test7_palette", "Palette:", 
                            choices = c("Blues", "Reds", "Greens", "Viridis"), 
                            selected = "Reds")),
        column(4, checkboxInput("test7_show_scale", "Show Scale", TRUE))
      )
    ),
    div(class = "info-box",
      "📌 Select a single column and observe the scale bar statistics. The shown Min/Max/Median should match the data exactly. For verification: if data = (100, 200, 300, 400, 500), then Min=100, Median=300, Max=500."
    ),
    uiOutput("test7_statistics"),
    luminaOutput("table7")
  ),
  
  div(class = "test-section",
    h2("📊 Test 8: Combination with Other Features"),
    div(class = "feature-description",
      "Tests heatmap combined with search, filters, pagination, and sorting."
    ),
    div(class = "control-panel",
      h4("Controls:"),
      fluidRow(
        column(3, selectInput("test8_palette", "Palette:", 
                            choices = c("Blues", "Greens", "Viridis"), 
                            selected = "Viridis")),
        column(3, checkboxInput("test8_show_values", "Show Values", TRUE)),
        column(3, checkboxInput("test8_show_scale", "Show Scale", TRUE)),
        column(3, checkboxInput("test8_enable_search", "Enable Search", TRUE))
      ),
      fluidRow(
        column(6, checkboxInput("test8_enable_filters", "Enable Filters", TRUE)),
        column(6, numericInput("test8_page_size", "Page Size:", value = 5, min = 3, max = 10))
      )
    ),
    div(class = "info-box",
      "📌 Test how heatmap works alongside other LuminaTable features. Search and filter results, change pages, and sort columns. The heatmap should persist across pagination."
    ),
    luminaOutput("table8")
  ),
  
  div(class = "test-section",
    h2("✅ Test Results & Notes"),
    div(class = "feature-description",
      "Track your evaluation results here."
    ),
    textAreaInput("test_notes", "Test Notes and Observations:", 
                  rows = 6, placeholder = "Document your findings..."),
    actionButton("save_notes", "Save Notes", class = "btn btn-primary"),
    uiOutput("notes_saved_message")
  )
)

server <- function(input, output, session) {
  
  # ============= TEST 1: Single Column =============
  output$table1 <- renderLumina({
    palette <- switch(input$test1_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(sales_data, 
           title = "Test 1: Single Column Heatmap",
           caption = "Heatmap applied to Price column only") |>
      opt_heatmap(
        columns = "Price",
        palette = palette,
        showValues = isTRUE(input$test1_show_values),
        showScale = isTRUE(input$test1_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 2: Multiple Columns =============
  output$table2 <- renderLumina({
    if (!isTRUE(input$test2_enable) || length(input$test2_columns) == 0) {
      return(lumina(sales_data, 
                   title = "Test 2: Multiple Column Heatmap",
                   caption = "No columns selected") |>
             opt_pagination(pageSize = 5))
    }
    
    palette <- switch(input$test2_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(sales_data,
           title = "Test 2: Multiple Column Heatmap",
           caption = paste("Heatmap applied to:", paste(input$test2_columns, collapse = ", "))) |>
      opt_heatmap(
        columns = input$test2_columns,
        palette = palette,
        showValues = isTRUE(input$test2_show_values),
        showScale = isTRUE(input$test2_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 3: Hide Values =============
  output$table3 <- renderLumina({
    # Select numeric columns dynamically based on user input
    numeric_cols <- c("Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales", "Price", "Stock", "Rating", "Profit_Margin")
    selected_cols <- head(numeric_cols, input$test3_columns_count)
    
    palette <- switch(input$test3_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(sales_data,
           title = "Test 3: Hide Values (Color-Only Mode)",
           caption = "Numeric values hidden, only colors displayed") |>
      opt_heatmap(
        columns = selected_cols,
        palette = palette,
        showValues = FALSE,
        showScale = isTRUE(input$test3_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 4: Employee Data =============
  output$table4 <- renderLumina({
    if (!isTRUE(input$test4_enable) || length(input$test4_columns) == 0) {
      return(lumina(employee_data,
                   title = "Test 4: Employee Data",
                   caption = "No columns selected") |>
             opt_pagination(pageSize = 5))
    }
    
    palette <- switch(input$test4_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(employee_data,
           title = "Test 4: Employee Performance Metrics",
           caption = "Multiple columns with different scales") |>
      opt_heatmap(
        columns = input$test4_columns,
        palette = palette,
        showValues = isTRUE(input$test4_show_values),
        showScale = isTRUE(input$test4_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 5: Weather Data =============
  output$table5 <- renderLumina({
    if (!isTRUE(input$test5_enable) || length(input$test5_columns) == 0) {
      return(lumina(weather_data,
                   title = "Test 5: Weather Data",
                   caption = "No columns selected") |>
             opt_pagination(pageSize = input$test5_page_size))
    }
    
    palette <- switch(input$test5_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(weather_data,
           title = "Test 5: Weather Data Heatmap",
           caption = "Seasonal trends visualization") |>
      opt_heatmap(
        columns = input$test5_columns,
        palette = palette,
        showValues = isTRUE(input$test5_show_values),
        showScale = isTRUE(input$test5_show_scale)
      ) |>
      opt_pagination(pageSize = input$test5_page_size)
  })
  
  # ============= TEST 6: Custom Palettes =============
  output$test6_palette_preview <- renderUI({
    low <- input$test6_color_low
    high <- input$test6_color_high
    
    # Validate hex colors
    if (!grepl("^#[0-9a-fA-F]{6}$", low) || !grepl("^#[0-9a-fA-F]{6}$", high)) {
      return(div(style = "color: red; font-weight: bold;", "Invalid hex color format"))
    }
    
    div(style = paste0("background: linear-gradient(to right, ", low, ", ", high, "); ",
                       "height: 40px; border-radius: 3px; border: 1px solid #ccc;"))
  })
  
  output$table6 <- renderLumina({
    # Validate colors
    low <- input$test6_color_low
    high <- input$test6_color_high
    
    if (!grepl("^#[0-9a-fA-F]{6}$", low) || !grepl("^#[0-9a-fA-F]{6}$", high)) {
      palette <- c("#f7fbff", "#6baed6", "#08306b")
    } else {
      palette <- c(low, "#888888", high)
    }
    
    lumina(sales_data,
           title = "Test 6: Custom Color Palettes",
           caption = paste0("Custom gradient: ", low, " to ", high)) |>
      opt_heatmap(
        columns = c("Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"),
        palette = palette,
        showValues = isTRUE(input$test6_show_values),
        showScale = isTRUE(input$test6_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 7: Scale Statistics =============
  output$test7_statistics <- renderUI({
    col <- input$test7_column
    values <- sales_data[[col]]
    
    min_val <- min(values)
    max_val <- max(values)
    sorted_vals <- sort(values)
    median_val <- sorted_vals[ceiling(length(sorted_vals) / 2)]
    mean_val <- mean(values)
    
    div(class = "info-box",
      h4("Expected Scale Bar Statistics:", style = "margin-top: 0;"),
      p(sprintf("Minimum: %.2f", min_val)),
      p(sprintf("Median: %.2f", median_val)),
      p(sprintf("Maximum: %.2f", max_val)),
      p(sprintf("Mean: %.2f", mean_val), style = "color: #666; font-size: 12px;")
    )
  })
  
  output$table7 <- renderLumina({
    palette <- switch(input$test7_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Reds" = c("#fff5f0", "#fb6a4a", "#67000d"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    lumina(sales_data,
           title = "Test 7: Scale Bar Statistics",
           caption = paste("Verify scale bar matches statistics for", input$test7_column)) |>
      opt_heatmap(
        columns = input$test7_column,
        palette = palette,
        showValues = TRUE,
        showScale = isTRUE(input$test7_show_scale)
      ) |>
      opt_pagination(pageSize = 5)
  })
  
  # ============= TEST 8: Combined Features =============
  output$table8 <- renderLumina({
    palette <- switch(input$test8_palette,
                     "Blues" = c("#f7fbff", "#6baed6", "#08306b"),
                     "Greens" = c("#f7fcf5", "#74c476", "#00441b"),
                     "Viridis" = c("#440154", "#21908C", "#FDE725"),
                     c("#f7fbff", "#6baed6", "#08306b"))
    
    tbl <- lumina(sales_data,
                 title = "Test 8: Heatmap + Search/Filters/Pagination",
                 caption = "All features working together")
    
    if (isTRUE(input$test8_enable_search)) {
      tbl <- tbl |>
        opt_search(show = TRUE, highlight = TRUE, position = "right", filters = isTRUE(input$test8_enable_filters))
    }
    
    tbl <- tbl |>
      opt_heatmap(
        columns = c("Q1_Sales", "Q2_Sales", "Q3_Sales", "Q4_Sales"),
        palette = palette,
        showValues = isTRUE(input$test8_show_values),
        showScale = isTRUE(input$test8_show_scale)
      ) |>
      opt_pagination(pageSize = input$test8_page_size)
    
    tbl
  })
  
  # ============= Notes Saving =============
  saved_notes <- reactiveVal("")
  
  observeEvent(input$save_notes, {
    saved_notes(Sys.time())
  })
  
  output$notes_saved_message <- renderUI({
    if (nchar(input$test_notes) > 0 && input$save_notes > 0) {
      div(class = "info-box", style = "background: #e8f5e9; border-left-color: #4caf50; margin-top: 15px;",
        p("✅ Notes saved at:", format(saved_notes(), "%Y-%m-%d %H:%M:%S")))
    }
  })
}

shinyApp(ui = ui, server = server)
