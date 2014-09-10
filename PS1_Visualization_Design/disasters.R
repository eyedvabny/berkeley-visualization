# Load some of the libs we'll be using for processing and visualization
library(dplyr)
library(ggplot2)

# Load in the provided disaster dataset
# (http://vis.berkeley.edu/courses/cs294-10-fa14/wiki/images/8/8d/Disasters_killed_over_100.csv.zip)
disasters <- read.csv('disasters_killed_over100.csv',stringsAsFactors=FALSE)

# Load in an auxillary dataset which matches countries to continents
# Taken from the same EM-DAT database as the original set
continent_country <- read.csv('continent_country.csv',stringsAsFactors=FALSE)

# Perform a left-join to insert the continents into the disaster data
disasters <- left_join(disasters,continent_country,by='Country')

# Some data cleaning
disasters <- within(disasters,{

    # As some others have pointed out, this really means Famine
    Type[Type=='Complex Disasters'] <- 'Famine'

    # Earthquakes cause tsunamis, but deathtoll is due to different causes
    Type[Sub_Type == 'Earthquake (ground shaking)'] <- 'Earthquake'
    Type[Sub_Type == 'Tsunami'] <- 'Tsunami'

    # Extreme temperatures have two extremes
    Type[Sub_Type == 'Cold wave'] <- 'Extreme Cold'
    Type[Sub_Type == 'Extreme winter conditions'] <- 'Extreme Cold'
    Type[Sub_Type == 'Heat wave'] <- 'Extreme Hot'

    # Really stupid name for a disaster; most are landslides
    Type[grep("mass movement",Type,ignore.case = TRUE)] <- 'Landslide'

    # Group all accidents
    Type[grep("accident",Type,ignore.case = TRUE)] <- 'Accident'
})

# We want to do some summarizing
disaster_impact <- disasters %>%
    group_by(Continent,Type) %>%
    summarize(deathToll = sum(Killed,na.rm=TRUE))

# Convert the continents and disasters to factors
disaster_impact$Continent <- factor(disaster_impact$Continent)
disaster_impact$Type <- factor(disaster_impact$Type)

# Plot this whole mess
png(filename="disaster_impact_by_continent.png",
    width=960,height=960,bg="transparent")

ggplot(disaster_impact, aes(x=Continent,y=deathToll,fill=Type)) +
    geom_bar(width=1,stat='identity',position='fill')+
    coord_polar()+
    ggtitle("Relative Population Impact of Natural Disasters, 1900-2008")+
    xlab("") + ylab("") +
    theme(
        text = element_text(size=20),
        plot.background = element_blank(),
        panel.background = element_blank(),
        panel.grid = element_blank(),
        panel.border = element_blank(),
        legend.background = element_blank(),
        axis.ticks.y = element_blank(),
        axis.text.y = element_blank(),
        axis.text.x = element_text(face='bold'))

dev.off()
