#!/usr/bin/env Rscript
# Test script to debug conditional formatting with single columns

# Load the package
library(LuminaTable)
library(shiny)

# Create a simple test data
test_data <- data.frame(
  Name = c("Alice", "Bob", "Charlie", "David"),
  Price = c(100, 500, 800, 1200),
  Stock = c(10, 50, 35, 90),
  Rating = c(4.2, 4.8, 3.9, 4.6),
  Category = c("A", "B", "A", "C"),
  stringsAsFactors = FALSE
)

# Test 1: Single column rule
cat("=== Test 1: Single Column Rule ===\n")
single_rule <- list(
  column = "Price",
  op = "gt",
  value = 600,
  style = list(bg = "#fff3e0", color = "#e65100")
)
cat("Single rule structure:\n")
print(str(list(single_rule)))

# Test what gets passed to opt_condformat
rules_list <- list(single_rule)
cat("\nRules list structure:\n")
print(str(rules_list))

# Create lumina widget
w <- lumina(test_data)
w_with_cf <- opt_condformat(w, rules = rules_list)

# Check what's in the config
cat("\nCondformat config in widget:\n")
print(str(w_with_cf$x$config$condformat))

# Test 2: Multiple column rules
cat("\n\n=== Test 2: Multiple Column Rules ===\n")
rules_multi <- list(
  list(column = "Price", op = "gt", value = 600, style = list(bg = "#fff3e0")),
  list(column = "Stock", op = "lt", value = 40, style = list(bg = "#ffebee")),
  list(column = "Rating", op = "gte", value = 4.5, style = list(bg = "#e8f5e9"))
)

w2 <- lumina(test_data)
w2_with_cf <- opt_condformat(w2, rules = rules_multi)

cat("Condformat config with multiple rules:\n")
print(str(w2_with_cf$x$config$condformat))

# Test 3: Using ... syntax like in app.R
cat("\n\n=== Test 3: Using ... Syntax ===\n")

# Simulate what happens with do.call
rules_from_do_call <- list(
  list(column = "Price", op = "gt", value = 600, style = list(bg = "#fff3e0"))
)

w3 <- lumina(test_data)
w3_with_cf <- do.call(
  opt_condformat,
  c(list(w3), rules_from_do_call, list(edit = FALSE))
)

cat("Condformat config from do.call:\n")
print(str(w3_with_cf$x$config$condformat))

cat("\nDone!\n")
