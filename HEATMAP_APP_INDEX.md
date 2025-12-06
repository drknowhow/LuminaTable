# LuminaTable Heatmap - Complete Evaluation Documentation Index

## Overview

This directory now contains a **comprehensive heatmap evaluation suite** for the LuminaTable widget's `opt_heatmap()` functionality. All components have been created, tested, and documented.

## Files Overview

| File | Lines | Purpose |
|------|-------|---------|
| `heatmap_app.R` | 615 | Main Shiny application with 8 tests |
| `HEATMAP_APP_README.md` | 294 | Detailed documentation of each test |
| `HEATMAP_APP_QUICKSTART.md` | 119 | Quick reference guide |
| `HEATMAP_APP_EVALUATION.md` | 330 | Comprehensive evaluation framework |
| `HEATMAP_APP_INDEX.md` | This file | Index and navigation |

**Total Documentation**: 1,100+ lines across 4 files

## Quick Navigation

### For First-Time Users
Start here: **[HEATMAP_APP_QUICKSTART.md](HEATMAP_APP_QUICKSTART.md)**
- How to run the app
- Quick summary of all tests
- Basic tips

### For Detailed Information
Read: **[HEATMAP_APP_README.md](HEATMAP_APP_README.md)**
- What each test does
- What to verify
- Expected values
- Troubleshooting

### For Complete Evaluation
Use: **[HEATMAP_APP_EVALUATION.md](HEATMAP_APP_EVALUATION.md)**
- Test matrix
- Feature checklist
- Verification steps
- Success criteria

### To Run the Tests
Execute: `heatmap_app.R`
```r
# In R console:
shiny::runApp('heatmap_app.R')

# From command line:
Rscript -e "shiny::runApp('heatmap_app.R', port=3838)"
```

## The 8 Tests at a Glance

| # | Test Name | Dataset | Primary Feature | Key Verification |
|---|-----------|---------|-----------------|------------------|
| 1 | **Single Column** | Sales (Price) | Basic heatmap | Color gradient, scale bar alignment |
| 2 | **Multiple Columns** | Sales (Q1-Q4) | Multi-column | Individual scales per column |
| 3 | **Color-Only Mode** | Sales (8 cols) | Hide values | showValues=FALSE works |
| 4 | **Employee Data** | Employees (6) | Different scales | Per-column normalization |
| 5 | **Weather Data** | Weather (12) | Many columns | Comprehensive patterns |
| 6 | **Custom Palettes** | Sales (Q1-Q4) | User colors | Hex validation, gradients |
| 7 | **Statistics** | Sales (Q1-Q4) | Accuracy | Min/Max/Median correct |
| 8 | **Integration** | Sales (full) | Features | Search, filters, pagination |

## Installation & Setup

```bash
# 1. Navigate to LuminaTable directory
cd u:\R\LuminaTable\LuminaTable

# 2. Ensure LuminaTable is installed
# In R console:
devtools::load_all()

# 3. Run the app
Rscript -e "shiny::runApp('heatmap_app.R', port=3838)"

# 4. Open browser to:
# http://127.0.0.1:3838
```

## What Gets Tested

### Core Functionality
- [x] Single column heatmap rendering
- [x] Multiple column rendering
- [x] Color-only mode (hide values)
- [x] Scale bar display
- [x] Statistics calculation (min/max/median)

### Color Palettes
- [x] Blues (light blue to dark blue)
- [x] Reds (light red to dark red)
- [x] Greens (light green to dark green)
- [x] Viridis (scientific palette)
- [x] Custom hex colors

### Features
- [x] Show/hide numeric values
- [x] Show/hide scale bar
- [x] Dynamic column selection
- [x] Color palette switching
- [x] Custom color input with validation

### Integration
- [x] Works with global search
- [x] Works with column filters
- [x] Works with pagination
- [x] Works with sorting
- [x] Maintains across page changes

## Data Provided

### Sales Data (10 products)
```
Numeric columns: Q1_Sales, Q2_Sales, Q3_Sales, Q4_Sales, Price, Stock, Rating, Profit_Margin
Used in: Tests 1, 2, 3, 6, 7, 8
```

### Employee Data (10 people)
```
Numeric columns: Base_Salary, Bonus, Performance_Score, Years_Employed, Projects_Completed, Satisfaction_Score
Used in: Test 4
```

### Weather Data (12 months)
```
Numeric columns: Avg_Temp, Max_Temp, Min_Temp, Humidity, Precipitation, Wind_Speed, Pressure, Sunshine_Hours
Used in: Test 5
```

## Expected Behavior Summary

### Visual
- Smooth color gradients from light to dark
- Clean alignment of scale bars with columns
- Readable text on colored backgrounds
- Professional appearance

### Functional
- Each column normalizes 0-100% independently
- Scale bar displays min, median, max
- Statistics calculated correctly
- All controls responsive and working

### Integration
- Features work together without conflicts
- Heatmap persists across pagination
- Search/filters update display correctly
- Sorting maintains visual integrity

## Evaluation Workflow

1. **Setup**: Run the app (see Installation section)
2. **Test 1-3**: Verify basic functionality
3. **Test 4-5**: Test with different data
4. **Test 6**: Validate custom colors
5. **Test 7**: Verify statistics accuracy
6. **Test 8**: Check feature integration
7. **Document**: Use Notes section to record observations
8. **Review**: Check against evaluation checklist

## Key Features to Verify

- [ ] Heatmap colors apply correctly
- [ ] Scale bar appears when enabled
- [ ] Min/Max/Median are accurate
- [ ] showValues toggle works
- [ ] showScale toggle works
- [ ] Custom colors validate properly
- [ ] Multiple columns work together
- [ ] Integration features don't break heatmap
- [ ] No JavaScript console errors
- [ ] UI is responsive

## Technical Reference

### opt_heatmap() Function Signature
```r
opt_heatmap(
  w,              # LuminaTable widget
  columns,        # Vector of column names (character)
  palette,        # Color palette (character vector)
  showValues,     # Show values in cells (logical)
  showScale       # Show scale footer (logical)
)
```

### Example Usage
```r
lumina(data) |>
  opt_heatmap(
    columns = c("Price", "Sales"),
    palette = c("#f7fbff", "#6baed6", "#08306b"),
    showValues = TRUE,
    showScale = TRUE
  )
```

### Palette Format
```r
# Minimum: 2 colors
palette = c("#start", "#end")

# Recommended: 3 colors
palette = c("#light", "#middle", "#dark")

# Maximum: 5 colors
palette = c("#1", "#2", "#3", "#4", "#5")
```

## Documentation Files

### HEATMAP_APP_README.md
**When to use**: Need detailed information about a specific test
**Contains**: 
- Test purposes and descriptions
- What to verify for each test
- Expected data statistics
- Color palette examples
- Troubleshooting guide
- Evaluation checklist

### HEATMAP_APP_QUICKSTART.md
**When to use**: Quick reference or first time running
**Contains**:
- How to run the app
- Test summary table
- Key controls
- Evaluation tips
- Data descriptions

### HEATMAP_APP_EVALUATION.md
**When to use**: Comprehensive evaluation
**Contains**:
- Complete test matrix
- Feature checklist
- Success criteria
- Technical details
- Statistics reference
- Troubleshooting matrix

## Success Criteria

The heatmap functionality is working correctly when:

1. **All 8 tests load** without errors or crashes
2. **Colors display properly** in smooth gradients
3. **Scale bar appears** when showScale=TRUE
4. **Statistics are accurate** (verified against reference data)
5. **showValues toggle** hides/shows values correctly
6. **Custom colors work** with proper hex validation
7. **Multiple columns** normalize independently
8. **Features integrate** without conflicts
9. **No browser errors** in developer console
10. **UI is responsive** to all user interactions

## Related Files in Repository

### Core Implementation
- `R/grammar.R` - `opt_heatmap()` function definition
- `inst/htmlwidgets/lumina.js` - Widget binding
- `inst/htmlwidgets/lib/lumina/lumina_engine.js` - Rendering engine
- `inst/htmlwidgets/lumina.css` - Styling

### Other Tests
- `app.R` - Main comprehensive test suite
- `DESCRIPTION` - Package metadata
- `NAMESPACE` - Exported functions

## Common Tasks

### Run the app
```r
shiny::runApp('heatmap_app.R')
```

### Test specific scenario
Open browser, go to specific test number (1-8), adjust controls, observe results

### Check statistics
Test 7 displays expected statistics for each column in an info box

### Use custom colors
Test 6 allows entry of hex colors with preview and real-time gradient display

### Verify integration
Test 8 includes search, filters, and pagination alongside heatmap

## Browser Console Debugging

**Open Developer Tools**: F12 or Ctrl+Shift+I

**Check for**:
- JavaScript errors (red X)
- Warnings (yellow ⚠)
- Network errors
- Console messages

**Common issues**:
- Missing columns -> check column names
- Invalid colors -> check hex format
- Layout issues -> check CSS in inspector

## Support & Troubleshooting

### Heatmap not showing
→ Check: column names exist, data is numeric, colors are valid

### Scale bar missing
→ Check: showScale=TRUE in controls, columns have data

### Wrong statistics
→ Check: Data values in Test 7 info box, compare with actual

### Custom colors not working
→ Check: Hex format (#RRGGBB), no spaces, valid range

For detailed troubleshooting, see **HEATMAP_APP_README.md** or **HEATMAP_APP_EVALUATION.md**

## Version Information

- **Created**: December 2025
- **Framework**: Shiny + LuminaTable
- **R Version**: 4.5+
- **Total Files**: 4 (1 app + 3 docs)
- **Total Lines**: 1,300+
- **Status**: ✓ Complete and ready

## Next Steps

1. **Read**: Start with HEATMAP_APP_QUICKSTART.md
2. **Run**: Execute `shiny::runApp('heatmap_app.R')`
3. **Test**: Work through tests 1-8 in order
4. **Verify**: Check against evaluation checklist
5. **Document**: Record findings in Notes section
6. **Review**: Compare with success criteria

---

**Quick Links**:
- [Quick Start Guide](HEATMAP_APP_QUICKSTART.md)
- [Detailed README](HEATMAP_APP_README.md)
- [Evaluation Framework](HEATMAP_APP_EVALUATION.md)

**Run the app**:
```r
shiny::runApp('heatmap_app.R')
```

**Status**: ✅ All tests ready for comprehensive evaluation
