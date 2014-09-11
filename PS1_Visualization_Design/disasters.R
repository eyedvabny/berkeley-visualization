# Data Cleaning And Visualization of Global Disaster Impact
# CR Eugene Yedvabny, 2014

# Load some of the libs we'll be using for processing and visualization
library(dplyr)
library(ggplot2)

# Load in the provided disaster dataset
# (http://vis.berkeley.edu/courses/cs294-10-fa14/wiki/images/8/8d/Disasters_killed_over_100.csv.zip)
disasters <- read.csv('disasters_killed_over100.csv', stringsAsFactors = FALSE)

# Load in an auxillary dataset which matches countries to continents
# Taken from the same EM-DAT database as the original set
continents.country <- read.csv('continent_country.csv', stringsAsFactors = FALSE)

# Perform a left-join to insert the continents into the disaster data
disasters <- left_join(disasters, continents.country, by = 'Country')

# Some data cleaning
disasters <- within(disasters,{

    # Complex causes
    Type[Type == 'Complex Disasters'] <- 'Complex'

    # Biological causes
    Type[Type == 'Epidemic'] <- 'Biological'

    # Climatological causes
    Type[Type %in%
             c('Drought','Extreme temperature','Wildfire')
         ] <- 'Climatological'

    # Geophysical causes
    Type[Type %in%
             c('Earthquake (seismic activity)','Mass movement dry','Volcano')
         ] <- 'Geophysical'

    # Hydrological causes
    Type[Type %in%
             c('Flood','Mass Movement Wet','Mass movement wet')
         ] <- 'Hydrological'

    # Meteorolical causes
    Type[Type == 'Storm'] <- 'Meteorolical'

    # Technological causes
    Type[grep('accident', Type, ignore.case = TRUE)] <- 'Technological'
})

# We want to do some summarizing
disasters.impact <- disasters %>%
    group_by(Continent, Type) %>%
    summarize(deathToll = sum(Killed, na.rm = TRUE))

# Add on average continent size
continents.size <- data.frame(
                    Continent = c('Oceania', 'Africa', 'Americas', 'Europe', 'Asia'),
                    Pop_fraction = c(0.01, 0.11, 0.14, 0.16, 0.58))
disasters.impact <- left_join(disasters.impact, continents.size, by = 'Continent')

# Assign continents as factors to ensure ordering by size
disasters.impact$Continent <- factor(disasters.impact$Continent,
                                    levels = c('Oceania','Africa','Americas','Europe','Asia'),
                                    ordered = TRUE)
disasters.impact$Type <- factor(disasters.impact$Type)

# Plot this whole mess
png(filename = "disaster_impact_by_continent.png",
    width = 960, height = 960, bg = "transparent")

ggplot(disasters.impact,
       aes(x = Continent, y = deathToll, fill = Type)) +
geom_bar(width=0.9,stat='identity',position='fill') +
coord_polar("y") +
scale_fill_brewer(type = 'qual',palette = 2) +
ggtitle("Relative Population Impact of Disasters, 1900-2008") +
xlab("") +
ylab("") +
theme(
   text = element_text(size=20),
   plot.background = element_blank(),
   panel.background = element_blank(),
   panel.grid = element_blank(),
   panel.border = element_blank(),
   legend.background = element_blank(),
   axis.ticks.x = element_blank(),
   axis.text.x = element_blank(),
   axis.text.y = element_text(face='bold')
)

dev.off()
