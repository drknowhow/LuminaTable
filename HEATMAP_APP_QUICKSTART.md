# Heatmap App - Quick Start Guide

## Files Created

### 1. `heatmap_app.R` (622 lines)
A comprehensive standalone Shiny application for evaluating heatmap functionality.

**Features**:
- 8 interactive tests covering all heatmap scenarios
- 3 high-quality datasets (sales, employees, weather)
- Multiple color palettes plus custom color support
- Professional UI with gradient styling
- Notes section for test observations

### 2. `HEATMAP_APP_README.md` (371 lines)
Detailed documentation including:
- Descriptions of all 8 tests
- What to verify in each test
- Expected statistics and data ranges
- Color palette examples
- Evaluation checklist
- Troubleshooting guide

## Quick Start

```bash
# Navigate to the LuminaTable directory
cd u:\R\LuminaTable\LuminaTable

# Run the app
Rscript -e "shiny::runApp('heatmap_app.R', host='127.0.0.1', port=3838)"
```

Then open your browser to: **http://127.0.0.1:3838**

## The 8 Tests

| Test | Purpose | Key Features |
|------|---------|--------------|
| 1 | Single Column | Basic heatmap on Price column |
| 2 | Multiple Columns | Q1-Q4 Sales with individual scales |
| 3 | Color-Only Mode | Hide values, show colors only |
| 4 | Employee Data | Diverse metrics with different ranges |
| 5 | Weather Data | Comprehensive seasonal trends |
| 6 | Custom Palettes | User-defined gradient colors |
| 7 | Statistics | Verify min/max/median calculations |
| 8 | Combined Features | Heatmap + search/filters/pagination |

## Key Controls Available

- **Color Palette**: Blues, Reds, Greens, Viridis, or Custom hex colors
- **Show Values**: Toggle numeric display (TRUE/FALSE)
- **Show Scale**: Toggle scale footer (TRUE/FALSE)
- **Column Selection**: Multi-select which columns to heatmap
- **Custom Colors**: Enter hex colors for gradients (#RRGGBB format)

## What Gets Tested

### Core Functionality
✓ Single column heatmap rendering
✓ Multiple column heatmap rendering
✓ Color-only mode (hideValues=FALSE)
✓ Scale bar display and statistics
✓ Min/Max/Median calculations
✓ Custom color palette support
✓ All built-in palettes (Blues, Reds, Greens, Viridis)

### Integration
✓ Heatmap with search functionality
✓ Heatmap with column filters
✓ Heatmap with pagination
✓ Heatmap with sorting
✓ Scale bar persistence across pages

### Data Handling
✓ Single-row datasets
✓ Multi-column numeric data
✓ Different data scales (dollars, percentages, counts, etc.)
✓ Seasonal/temporal patterns
✓ Diverse value ranges

## Expected Behavior

### Scale Bar
- Displays in separate footer above info footer
- One cell per heatmap column
- Shows: Column Label | Gradient Bar | Min  Median  Max
- Updates correctly for filtered data

### Colors
- Smooth gradient from low (light) to high (dark)
- Per-column normalization (each column 0-100%)
- Proper color interpolation

### Values
- Readable on colored backgrounds
- Hidden when showValues=FALSE
- Displayed with proper formatting

## Data Sets Included

### Sales Data (10 rows)
- 4 quarterly sales columns
- Price, Stock, Rating, Profit Margin

### Employee Data (10 rows)
- Salary and bonus information
- Performance metrics (0-5 scale)
- Years employed, Projects completed

### Weather Data (12 rows)
- Temperature, humidity, precipitation
- Wind speed, pressure, sunshine hours
- Seasonal patterns

## Evaluation Tips

1. **Start with Test 1** to understand basic functionality
2. **Use Test 7** to verify statistics accuracy
3. **Check browser console** (F12) for errors
4. **Try different palettes** to see gradient quality
5. **Toggle showValues** to see color-only mode
6. **Toggle showScale** to see scale bar behavior
7. **Use Test 8** to verify feature integration

## Documentation

Detailed documentation is in `HEATMAP_APP_README.md` which includes:
- Purpose of each test
- Specific verification steps
- Expected data statistics
- Color palette examples
- Complete evaluation checklist
- Troubleshooting guide

## Support

If you encounter any issues:
1. Check browser console (F12) for JavaScript errors
2. Verify hex color format in custom palettes
3. Check that selected columns are numeric
4. Review the troubleshooting section in HEATMAP_APP_README.md
5. Ensure LuminaTable package is properly installed

---

**Status**: Complete and ready for use
**Lines of Code**: 622 (app) + 371 (docs) = 993 total
**Tests**: 8 comprehensive tests
**Datasets**: 3 (sales, employees, weather)
**Palettes**: 4 built-in + custom support
