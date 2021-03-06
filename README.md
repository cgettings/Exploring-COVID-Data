
# Map of cumulative COVID-19 cases in NYC

Inspired by the [*COVID-19 Data by ZIP Code*](https://www1.nyc.gov/site/doh/covid/covid-19-data-totals.page#zip) map on NYC's COVID data website

**See map at https://cgettings.github.io/Exploring-COVID-Data/data_by_modzcta_map.html**

## Code

### R

Initial `{leaflet}` code: [`code/mapping_cumulative_data.R`](code/mapping_cumulative_data.R)  

### JavaScript

Adding tooltips and color scales for ZIP codes; adding a label for date the data was downloaded: [`code/js/add_tooltips_and_legends.js`](code/js/add_tooltips_and_legends.js)  

**TODO:**

- ~Add persistent stats label on click~
- Show changes over time with slider control
- Maintain selected ZIP code when switching base layers
- Add graph overlay on click
