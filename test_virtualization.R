# Test virtualization scrolling with large dataset

library(shiny)
library(LuminaTable)
library(dplyr)

# Create a large dataset
large_data <- data.frame(
  ID = 1:1000,
  Name = paste("Person", 1:1000),
  Age = sample(18:70, 1000, replace = TRUE),
  Department = sample(c("Engineering", "Sales", "HR", "Marketing", "Finance"), 1000, replace = TRUE),
  Salary = sample(30000:150000, 1000, replace = TRUE),
  Score = round(runif(1000, 0, 100), 1),
  stringsAsFactors = FALSE
)

ui <- fluidPage(
  titlePanel("Virtualization Scrolling Test - 1000 Rows"),
  
  h3("Test Instructions:"),
  tags$ol(
    tags$li("The table below has 1000 rows with virtualization enabled"),
    tags$li("Try scrolling to the bottom - you should be able to reach row 1000"),
    tags$li("Only ~20-30 rows are rendered at a time for performance"),
    tags$li("Spacer rows create the illusion of a full table"),
    tags$li("Check browser console for virtualization debug logs")
  ),
  
  hr(),
  
  h4("Table with Virtualization (scroller mode)"),
  luminaOutput("large_table")
)

server <- function(input, output, session) {
  
  output$large_table <- renderLumina({
    lumina(large_data) %>%
      opt_pagination(
        pageSize = 20,           # Show 20 rows in viewport
        scroller = TRUE       # Enable scroller mode (no page buttons)
      ) %>%
      opt_performance(
        virtualization = TRUE,        # Enable virtualization
        virtualizationBuffer = 10     # Render 10 extra rows above/below viewport
      ) %>%
      set_theme("striped")
  })
}

shinyApp(ui, server)
