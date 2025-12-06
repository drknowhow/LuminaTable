# Heatmap Comprehensive Evaluation App (`heatmap_app.R`)

A standalone Shiny application that provides comprehensive testing and evaluation of the LuminaTable heatmap functionality (`opt_heatmap()`).

## Overview

This app contains **8 interactive tests** designed to thoroughly evaluate all aspects of heatmap functionality, including:
- Single and multiple column heatmaps
- Color-only mode (value hiding)
- Different color palettes
- Scale bar statistics verification
- Integration with other LuminaTable features

## Running the App

```r
# Option 1: Using shiny::runApp()
shiny::runApp('heatmap_app.R', host='127.0.0.1', port=3838)

# Option 2: In RStudio
# Open heatmap_app.R and click the "Run App" button

# Option 3: From terminal
Rscript -e "shiny::runApp('heatmap_app.R')"
```

## Test Descriptions

### Test 1: Single Column Heatmap
**Purpose**: Verify basic heatmap functionality on a single numeric column

**Controls**:
- Color Palette selector (Blues, Reds, Greens, Viridis, Custom)
- Show/Hide numeric values toggle
- Show/Hide scale bar toggle

**What to Verify**:
- Color gradient properly applied to Price column
- Color range from low (light) to high (dark)
- Scale bar (if enabled) appears below table
- Scale bar aligns with the Price column
- Min/Max/Median values displayed correctly

**Data Used**: Sales data (10 products)

---

### Test 2: Multiple Column Heatmap
**Purpose**: Test heatmap applied to multiple columns simultaneously

**Controls**:
- Color Palette selector
- Show/Hide values toggle
- Show/Hide scale bar toggle
- Multi-select checkbox for columns (Q1_Sales, Q2_Sales, Q3_Sales, Q4_Sales)

**What to Verify**:
- Each selected column displays its own heatmap
- Scale bar shows separate cells for each column
- Each column's scale bar displays its own min/max/median
- Colors are normalized per-column (each column 0-100%)
- All scale bars align properly in the footer

**Data Used**: Quarterly sales data

---

### Test 3: Hide Values (Color-Only Mode)
**Purpose**: Test displaying only colors without numeric content

**Controls**:
- Color Palette selector
- Number of columns slider (1-8)
- Show/Hide scale bar toggle

**What to Verify**:
- Numeric values are hidden from cells
- Only colored backgrounds visible
- Hover tooltip still shows values (if implemented)
- Scale bar still displays with statistics
- Layout remains clean and organized

**Data Used**: Sales data with multiple numeric columns

---

### Test 4: Employee Data - Multiple Metrics
**Purpose**: Test heatmap on diverse metrics with different scales

**Controls**:
- Color Palette selector
- Show/Hide values toggle
- Show/Hide scale bar toggle
- Multi-select columns from:
  - Base_Salary (45k-95k)
  - Bonus (7.5k-15k)
  - Performance_Score (3.9-4.9)
  - Years_Employed (3-12)
  - Projects_Completed (8-42)
  - Satisfaction_Score (3.8-4.8)

**What to Verify**:
- Each column normalizes independently
- Salary column shows different color distribution than performance score
- Min/Max ranges reflect actual data (e.g., salary in thousands, scores in ones)
- Scale bar displays proper statistics
- No mixing of scales between columns

**Data Used**: 10 employees with performance metrics

---

### Test 5: Weather Data - Comprehensive Heatmap
**Purpose**: Test heatmap with 8 numeric columns showing seasonal trends

**Controls**:
- Color Palette selector
- Show/Hide values toggle
- Show/Hide scale bar toggle
- Show/Hide heatmap toggle
- Compact mode checkbox
- Page size selector (6-12)
- Multi-select columns:
  - Avg_Temp (32-85°F)
  - Humidity (42-72%)
  - Precipitation (2.1-4.2 inches)
  - Wind_Speed (8-15 mph)
  - Pressure (29.5-30.2 inHg)
  - Sunshine_Hours (110-280 hours)

**What to Verify**:
- All seasonal trends visible across columns
- Temperature shows expected pattern (low winter, high summer)
- Precipitation varies seasonally
- Multiple columns' scales align properly
- Can toggle between showing all columns and hiding some
- Pagination works correctly with heatmap persistence

**Data Used**: 12 months of weather data

---

### Test 6: Custom Color Palettes
**Purpose**: Test user-defined gradient colors

**Controls**:
- Low Value Color input (hex color picker, default: #ffeda0)
- High Value Color input (hex color picker, default: #f03b20)
- Color preview gradient bar
- Show/Hide values toggle
- Show/Hide scale bar toggle

**What to Verify**:
- Custom gradient preview shows transition
- Heatmap uses custom colors instead of presets
- Gradient bar in scale footer shows custom colors
- Color validation (must be valid hex format)
- Invalid colors fallback to default palette

**Sample Gradients to Try**:
- Fire: `#ffeda0` (yellow) to `#f03b20` (red)
- Ocean: `#f7fbff` (white) to `#08306b` (navy)
- Forest: `#f7fcf5` (white) to `#00441b` (dark green)
- Custom: `#ffffcc` to `#800026` (warm)

**Data Used**: Sales quarterly data

---

### Test 7: Scale Bar Statistics Verification
**Purpose**: Verify scale bar displays correct min/max/median calculations

**Controls**:
- Column selector (Q1_Sales, Q2_Sales, Q3_Sales, Q4_Sales)
- Color Palette selector
- Show scale bar toggle
- **Expected Statistics Box** shows calculated values

**What to Verify**:
- Scale bar Min value matches expected minimum
- Scale bar Max value matches expected maximum
- Scale bar Median value is correct (middle value when sorted)
- Statistics update when switching columns
- All values rounded to 2 decimal places

**Expected Statistics** (displayed in info box):
- Q1_Sales: Min=320, Median=920, Max=2100
- Q2_Sales: Min=380, Median=1050, Max=2100
- Q3_Sales: Min=410, Median=980, Max=2100
- Q4_Sales: Min=550, Median=1200, Max=2100

**Data Used**: Quarterly sales data

---

### Test 8: Combination with Other Features
**Purpose**: Test heatmap working alongside search, filters, pagination

**Controls**:
- Color Palette selector (Blues, Greens, Viridis)
- Show/Hide values toggle
- Show/Hide scale bar toggle
- Enable/Disable global search checkbox
- Enable/Disable column filters checkbox
- Page size selector (3-10 rows)

**What to Verify**:
- Search functionality works with heatmap
- Filtering by product name/category works
- Heatmap persists when changing pages
- Scale bar updates based on filtered data? (or stays global?)
- Sorting columns still highlights sorted columns properly
- All UI elements remain responsive

**Data Used**: Sales data with product names and categories

---

## Datasets Included

### Sales Data
```r
10 products with columns:
- Product (name)
- Category (type)
- Q1_Sales through Q4_Sales (numeric)
- Price (numeric)
- Stock (numeric)
- Rating (numeric)
- Profit_Margin (numeric)
```

### Employee Data
```r
10 employees with columns:
- Name
- Department
- Base_Salary
- Bonus
- Performance_Score
- Years_Employed
- Projects_Completed
- Satisfaction_Score
```

### Weather Data
```r
12 months with columns:
- Month (name)
- Avg_Temp (F)
- Max_Temp (F)
- Min_Temp (F)
- Humidity (%)
- Precipitation (inches)
- Wind_Speed (mph)
- Pressure (inHg)
- Sunshine_Hours
```

## Color Palettes

### Built-in Palettes
- **Blues**: `#f7fbff` → `#6baed6` → `#08306b`
- **Reds**: `#fff5f0` → `#fb6a4a` → `#67000d`
- **Greens**: `#f7fcf5` → `#74c476` → `#00441b`
- **Viridis**: `#440154` → `#21908C` → `#FDE725`

### Custom Palettes
Enter any valid 6-digit hex colors. Examples:
- `#ffeda0` (light yellow) to `#f03b20` (orange-red)
- `#e5f5ff` (light blue) to `#00008b` (dark blue)
- `#fffff0` (cream) to `#8b0000` (dark red)

## Evaluation Checklist

Use the **Test Results & Notes** section to document your findings:

### Required Tests
- [ ] All 8 tests load without errors
- [ ] Single column heatmap displays correctly
- [ ] Multiple columns work simultaneously
- [ ] Color-only mode hides values properly
- [ ] Custom colors work as expected
- [ ] Scale bar statistics are accurate
- [ ] Heatmap works with search/filters/pagination
- [ ] No JavaScript errors in browser console

### Visual Verification
- [ ] Colors gradient smoothly from low to high
- [ ] Scale bars align with table columns
- [ ] Text is readable on colored backgrounds
- [ ] Min/Max/Median values are correctly positioned
- [ ] Gradient bar shows proper color transitions
- [ ] Table remains responsive to all interactions

### Edge Cases
- [ ] Works with single-column selection
- [ ] Works with all columns selected
- [ ] Handles empty columns correctly
- [ ] Custom colors validate properly
- [ ] Pagination preserves heatmap across pages
- [ ] Works with filtered data

## Technical Details

### opt_heatmap() Parameters Used
```r
opt_heatmap(
  columns,              # Vector of column names
  palette,              # Color palette (2-5 colors)
  showValues = TRUE,    # Show/hide numeric content
  showScale = FALSE     # Show/hide scale bar in footer
)
```

### Scale Bar Features
- Displays in separate footer above info footer
- Creates one cell per visible heatmap column
- Shows column label, gradient bar, and statistics
- Calculates min, median, max from full dataset
- Maintains alignment with table columns using fixed table layout

### Browser Console
Open browser DevTools (F12) to check for:
- No JavaScript errors
- Proper console output for debugging
- Network requests complete successfully

## Troubleshooting

### Heatmap not showing
- Verify `opt_heatmap()` is called with valid column names
- Check that selected columns are numeric
- Ensure `showScale` is set appropriately

### Scale bar missing
- Enable `showScale = TRUE` in test controls
- Verify columns have numeric data
- Check browser console for JavaScript errors

### Colors look wrong
- Verify hex color format (#RRGGBB)
- Check palette has 2-5 colors
- Try built-in palettes first

### Statistics don't match
- Manually verify min/max of data
- Check if data includes NA or non-numeric values
- Verify median calculation (middle value of sorted array)

## Notes

- All tests use local data (no external connections)
- Each test is independent and can be evaluated separately
- Save your observations in the Notes section at the bottom
- Emoji characters have been removed for compatibility
- Fully compatible with all LuminaTable features

## Related Files

- `app.R` - Main comprehensive test suite for all LuminaTable features
- `R/grammar.R` - `opt_heatmap()` function definition
- `inst/htmlwidgets/lib/lumina/lumina_engine.js` - heatmap rendering engine
- `inst/htmlwidgets/lumina.css` - heatmap styling classes

---

**Version**: 1.0  
**Created**: December 2025  
**Framework**: Shiny + LuminaTable  
**Purpose**: Comprehensive heatmap evaluation and testing
