# Load some of the libs we'll be using for processing and visualization
library(dplyr)
library(ggplot2)

# Load in the provided disaster dataset
# (http://vis.berkeley.edu/courses/cs294-10-fa14/wiki/images/8/8d/Disasters_killed_over_100.csv.zip)
disasters <- read.csv('disasters_killed_over100.csv',stringsAsFactors=FALSE)

# Some data cleaning
disasters <- within(disasters,{
    # Numbers are too high and cause an overflow; reduce
    Cost_dollars <- Cost_dollars/1000

    # As some others have pointed out, this really means Famine
    Type[Type=='Complex Disasters'] <- 'Famine'

    # Apparently Tsunamis cause earthquakes
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

test <- arrange(disasters,Type,Sub_Type)

# We want to do some summarizing
disaster_impact <- disasters %>%
    group_by(Type,Country) %>%
    summarize(
        deathToll = sum(Killed,na.rm=TRUE),
        dollarCost = sum(Cost_dollars,na.rm=TRUE)
    ) %>%
    mutate(
        humanCost = sum(deathToll),
        materialCost = sum(dollarCost)
    ) %>%
    arrange(
        desc(humanCost),desc(deathToll)
    )
