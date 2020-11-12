###########################################################################################-
###########################################################################################-
##
## Leaflet map for COVID-19 data in NYC ---
##
###########################################################################################-
###########################################################################################-

# TODO: - CASE COUNT OVER TIME "CURVE" PLOT ON CLICK
#       - ADD ZIP CODE SEARCH

#=========================================================================================#
# Setting up ----
#=========================================================================================#

#-----------------------------------------------------------------------------------------#
# Loading libraries ----
#-----------------------------------------------------------------------------------------#

library(tidyverse)
library(lubridate)
library(leaflet)
library(leaflet.extras)
library(htmltools)
library(htmlwidgets)
library(here)
library(glue)
library(viridis)
library(fs)
library(scales)
library(sf)

#-----------------------------------------------------------------------------------------#
# Loading data
#-----------------------------------------------------------------------------------------#

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# From GitHub
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

base_url <- "https://raw.githubusercontent.com/nychealth/coronavirus-data/master/totals/"

data_by_modzcta <- read_csv(str_c(base_url, "data-by-modzcta.csv"))


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Map layers
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

# source: https://github.com/nychealth/coronavirus-data/tree/master/Geography-resources

modzcta <- 
    st_read(here("data/gis/zcta/MODZCTA_2010.shp")) %>% 
    st_transform('+proj=longlat +datum=WGS84') %>% 
    drop_na()


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Joining data to map layers
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

data_by_modzcta_sf <- 
    left_join(
        modzcta, 
        data_by_modzcta %>% mutate(MODIFIED_ZCTA = as.character(MODIFIED_ZCTA)), 
        by = c("MODZCTA" = "MODIFIED_ZCTA")
    )


#=========================================================================================#
# Mapping overall case rates ----
#=========================================================================================#

#-----------------------------------------------------------------------------------------#
# Adding extras
#-----------------------------------------------------------------------------------------#

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Reading in javascript for tooltips and legends
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

add_tooltips_and_legends <- read_file(here("code/js/add_tooltips_and_legends.js"))

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Reading in javascript for date label overlay
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

updated_date <- today()

updated_date_js <- 
    read_file(here("code/js/updated_date.js")) %>% 
    str_replace("####", strftime(updated_date, format = "%x"))

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Defining color palette
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

pal <-
    colorNumeric(
        viridis(128, option = "C", direction = -1),
        domain = NULL,
        na.color = "#666666"
    )

#-----------------------------------------------------------------------------------------#
# Constructing map
#-----------------------------------------------------------------------------------------#

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
# Tiles and lines
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #

data_by_modzcta_map <- 
    
    leaflet(data = data_by_modzcta_sf) %>% 
    
    # dynamic URL hash
    
    addHash() %>% 
    
    # base layer
    
    addProviderTiles(provider = providers$CartoDB.DarkMatterNoLabels) %>%
    
    # street lines, to better distinguish neighborhood locations
    
    addTiles(
        urlTemplate = "//stamen-tiles.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png",
        attribution =
            glue(
                'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ',
                '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> ',
                '&mdash; Map data &copy; ',
                '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            ),
        group = "Street Lines",
        options = tileOptions(opacity = 0.5, pane = "markerPane", zIndex = 601)
    ) %>%
    
    # map labels, to better distinguish neighborhood locations
    
    addProviderTiles(
        provider = providers$Stamen.TonerLabels,
        group = "Map Labels",
        options = providerTileOptions(opacity = 1, pane = "markerPane", zIndex = 602)
    ) %>%
    
    
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    # ZCTA polygons
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    
    # case rate
    
    addPolygons(
        group = "Case rate (per 100k)",
        color = ~ pal(COVID_CASE_RATE),
        fillColor = ~ pal(COVID_CASE_RATE),
        layerId = ~ str_c("case_", MODZCTA),
        stroke = FALSE,
        weight = 0.25,
        opacity = 0,
        fillOpacity = 1,
        highlightOptions = 
            highlightOptions(
                stroke = TRUE,
                color = "cyan",
                weight = 2.5,
                bringToFront = TRUE,
                sendToBack = TRUE,
                opacity = 1,
                fillOpacity = 1,
                fill = TRUE
            ),
        options = pathOptions(pane = "overlayPane")
    ) %>% 
    
    # death rate
    
    addPolygons(
        group = "Death rate (per 100k)",
        color = ~pal(COVID_DEATH_RATE),
        fillColor = ~pal(COVID_DEATH_RATE),
        layerId = ~ str_c("death_", MODZCTA),
        stroke = FALSE,
        weight = 0.25,
        opacity = 0,
        fillOpacity = 1,
        highlightOptions = 
            highlightOptions(
                stroke = TRUE,
                color = "cyan",
                weight = 2.5,
                bringToFront = TRUE,
                sendToBack = TRUE,
                opacity = 1,
                fillOpacity = 1,
                fill = TRUE
            ),
        options = pathOptions(pane = "overlayPane")
    ) %>% 
    
    # positive tests
    
    addPolygons(
        group = "Percent positive tests",
        color = ~pal(PERCENT_POSITIVE),
        fillColor = ~pal(PERCENT_POSITIVE),
        layerId = ~ str_c("test_", MODZCTA),
        stroke = FALSE,
        weight = 0.25,
        opacity = 0,
        fillOpacity = 1,
        highlightOptions = 
            highlightOptions(
                stroke = TRUE,
                color = "cyan",
                weight = 2.5,
                bringToFront = TRUE,
                sendToBack = TRUE,
                opacity = 1,
                fillOpacity = 1,
                fill = TRUE
            ),
        options = pathOptions(pane = "overlayPane")
    ) %>% 
    
    
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    # ZCTA boundaries (turned off by default)
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    
    addPolygons(
        group = "ZIP Boundaries",
        layerId = ~ str_c("zip_", MODZCTA),
        color = "white", 
        stroke = TRUE,
        fill = FALSE,
        weight = 0.5,
        opacity = 0.85,
        highlightOptions = 
            highlightOptions(
                stroke = FALSE,
                color = "white",
                weight = 0.1,
                opacity = 0,
                fillOpacity = 0,
                fill = FALSE
            ),        
        options = pathOptions(pane = "shadowPane")
    ) %>% 
    
    
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    # Legends for each group (modified in JS)
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    
    addLegend(
        position = "bottomleft",
        pal = pal,
        values = ~ COVID_CASE_RATE,
        group = "Case rate (per 100k)",
        title = "Case rate",
        opacity = 0.95,
        layerId = "case_rate_legend",
        className = "legend leaflet-control-layers-expanded"
    ) %>%
    
    addLegend(
        position = "bottomleft",
        pal = pal,
        values = ~ COVID_DEATH_RATE,
        group = "Death rate (per 100k)",
        title = "Death rate",
        opacity = 0.95,
        layerId = "death_rate_legend",
        className = "legend leaflet-control-layers-expanded"
    ) %>%
    
    addLegend(
        position = "bottomleft",
        pal = pal,
        values = ~ PERCENT_POSITIVE,
        group = "Percent positive tests",
        title = "Percent<br>positive",
        opacity = 0.95,
        layerId = "percent_positive_legend",
        className = "legend leaflet-control-layers-expanded"
    ) %>%
    
    
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    # Adding layer control
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    
    addLayersControl(
        baseGroups = c("Case rate (per 100k)", "Death rate (per 100k)", "Percent positive tests"), 
        overlayGroups = c("Street Lines", "Map Labels", "ZIP Boundaries"),
        position = "topright",
        options = layersControlOptions(collapsed = FALSE, autoZIndex = FALSE)
    ) %>% 
    
    # hiding street lines and map labels to reduce clutter
    
    hideGroup(c("Street Lines", "Map Labels")) %>% 
    
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    # Adding javascript
    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - #
    
    # displaying tooltips and legends
    
    onRender(
        str_c(
            "function(el, x, data) {\n",
            add_tooltips_and_legends,
            "}"
        ),
        data = 
            data_by_modzcta_sf %>%
            as_tibble() %>%
            select(-c(geometry, label, BOROUGH_GROUP)) %>%
            drop_na()
    ) %>% 
    
    # displaying updated at date
    
    onRender(
        str_c(
            "function(el, x) {\n",
            "console.log('onRender');",
            updated_date_js,
            "}"
        )
    )

data_by_modzcta_map

#-----------------------------------------------------------------------------------------#
# Saving map ----
#-----------------------------------------------------------------------------------------#

saveWidget(
    widget = data_by_modzcta_map,
    file = here("docs/data_by_modzcta_map.html"),
    selfcontained = TRUE,
    title = "Cumulative COVID-19 Data by ZIP Code"
)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# #
# #                             ---- THIS IS THE END! ----
# #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
