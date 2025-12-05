# Build and Install LuminaTable Package
# Run this script to properly install the package so library() works

# remove.packages("LuminaTable")

# Clean up any cached/compiled files
cat("\nStep 0.5: Cleaning build artifacts...\n")
pkg_dir <- "u:/R/LuminaTable/LuminaTable"
setwd(pkg_dir)

# Remove compiled files and caches
clean_dirs <- c("src/*.o", "src/*.so", "src/*.dll", ".Rproj.user")
for (pattern in clean_dirs) {
  files_to_remove <- Sys.glob(file.path(pkg_dir, pattern))
  if (length(files_to_remove) > 0) {
    unlink(files_to_remove, recursive = TRUE, force = TRUE)
  }
}
cat("  ✓ Build artifacts cleaned\n")

# Set working directory to package root
setwd(pkg_dir)

cat("\nStep 1: Generating documentation and NAMESPACE...\n")
devtools::document()

cat("\nStep 2: Building package...\n")
pkg_file <- devtools::build()

devtools::unload("LuminaTable")

# cat("\nStep 3: Installing package from built file...\n")
# # Force reinstall even if version hasn't changed
# # Suppress Rd warnings about \item macros (they're false positives from roxygen2)
install.packages(pkg_file, repos = NULL, type = "source")
# 
# cat("\n✓ Package installed successfully!\n")
# cat("\nYou can now use:\n")
# cat("  library(LuminaTable)\n")
# cat("\nTo reload during development, use:\n")
# cat("  devtools::load_all()\n")
# cat("\nTo test the app, run:\n")
# cat("  shiny::runApp('u:/R/LuminaTable/LuminaTable/app.R')\n")
