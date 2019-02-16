library(dplyr)
library(ggplot2)
library(ggmap)
library(readr)

eur_peaks <- read_delim("data/eur_peaks.csv", delim = ";")

plt <- ggplot(eur_peaks, aes(x = lon, y = lat, text = Peak)) + 
  borders("world", regions = eur_ctrs, colour = "gray80", fill = "gray50",
          ylim = c(30, 70), xlim = c(-30, 72)) + 
  xlim(c(-30, 62)) +
  ylim(c(35, 72)) +
  geom_point(aes(fill = Climbed), size = 4, shape = 21, alpha = 0.7) +
  scale_fill_manual(values = c("#CC3300", "#00FF33")) +
  ggtitle(paste0("Climbed ", sum(eur_peaks$Climbed == "yes"), 
                 " European countries' highest peaks, ",
                 "out of 46")) +
  theme(axis.title = element_blank(),
        axis.text = element_blank(),
        axis.ticks = element_blank(),
        plot.title = element_text(hjust = 0.5, face = "bold"),
        legend.position = "top")

#ggplotly(p, tooltip = "text")

ggsave("img/kge.png", plot = plt,
       height = 6, width = 9)
