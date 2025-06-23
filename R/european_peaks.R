library(dplyr)
library(ggplot2)
library(ggmap)
library(readr)

eur_ctrs <- c("Portugal", "Spain", "Monaco", "France", "Poland",
              "Gibraltar", "England", "Scotland", "Ireland", "Belgium",
              "Netherlands", "Germany", "Switzerland", "Austria", "Italy",
              "SanMarino", "Vatican", "Croatia", "Montenegro", "Greece",
              "Bulgaria", "Romania", "Hungary", "Slovakia", "CzechRepublic",
              "Denmark", "Sweden", "Norway", "Iceland", "Georgia", "Cyprus",
              "UK", "Czech Republic", "Serbia", "Kosovo", "Moldova", "Ukraine",
              "Russia", "Faroe Islands", "Lithuania", "Latvia", "Macedonia",
              "Estonia", "Malta", "Belarus", "Turkey", "Slovenia", "Finland",
              "Kazakhstan", "Bosnia", "Albania", "Luxembourg", "Liechtenstein",
              "Azerbaijan", "Armenia")

eur_peaks <- read_delim("../data/eur_peaks.csv", delim = ";")

kable(
  eur_peaks %>% 
    select(-lat, -lon) %>% 
    mutate(Rank = row_number(),
           Elevation = paste0(Elevation, " m")) %>% 
    select(Rank, everything())
)

plt <- ggplot(eur_peaks, aes(x = lon, y = lat, text = Peak)) + 
  borders("world", regions = eur_ctrs, colour = "gray80", fill = "gray50",
          ylim = c(30, 70), xlim = c(-30, 72)) + 
  xlim(c(-30, 62)) +
  ylim(c(35, 72)) +
  geom_point(aes(fill = Climbed), size = 4, shape = 21, alpha = 0.7) +
  scale_fill_manual(values = c("#CC3300", "#00FF33")) +
  #  ggtitle(paste0("Climbed ", sum(eur_peaks$Climbed == "yes"), 
  #                 " European countries' highest peaks, ",
  #                 "out of 46")) +
  theme(axis.title = element_blank(),
        axis.text = element_blank(),
        axis.ticks = element_blank(),
        plot.title = element_text(hjust = 0.5, face = "bold"),
        legend.position = "none")

#ggplotly(p, tooltip = "text")

ggsave("../img/kge.png", plot = plt,
       height = 6, width = 9)
