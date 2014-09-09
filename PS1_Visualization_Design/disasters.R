# Load some of the libs we'll be using for processing and visualization
library(dplyr)
library(ggplot2)

# Load in the provided disaster dataset
# (http://vis.berkeley.edu/courses/cs294-10-fa14/wiki/images/8/8d/Disasters_killed_over_100.csv.zip)
disasters <- read.csv('disasters_killed_over100.csv',stringsAsFactors=FALSE)

#
disaster_impact <- disasters %>%
  group_by(Type,Country) %>%
  summarize(
    deathToll = sum(Killed,na.rm=TRUE),
    dollarCost = sum(Cost_dollars,na.rm=TRUE)
  ) %>%
  filter(Type == 'Flood')
  mutate(
    totCost = sum(dollarCost)
  )


mutate(
  totCost = sum(Cost_dollars,na.rm=TRUE),
  totDeath = sum(Killed,na.rm=TRUE)) %>%
  arrange(Type,desc(totCost))
