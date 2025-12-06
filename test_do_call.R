# Simple test to verify conditional formatting rule structure
rules_list <- list(
  list(column = "Price", op = "gt", value = 600, style = list(bg = "#fff3e0"))
)

# Simulate what do.call does
result <- do.call(
  function(w, ..., rules = NULL, edit = FALSE) {
    if (is.null(rules)) {
      rules <- list(...)
    }
    list(rules = rules, edit = edit)
  },
  c(list("widget"), rules_list, list(edit = FALSE))
)

cat("Result of do.call simulation:\n")
print(str(result))

cat("\nRules in result:\n")
print(result$rules)

cat("\nNumber of rules:\n")
print(length(result$rules))

cat("\nFirst rule:\n")
print(result$rules[[1]])

cat("\nFirst rule column:\n")
print(result$rules[[1]]$column)
