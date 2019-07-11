library(dplyr)
library(ggplot2)
library(ggmap)
library(plotly)

visited <- list(
  # Europe --------------------------------------------------------------------
  "Portugal" = c("Lisbon", "Porto", "Sintra", "Cascais", "Cabo da Roca"),
  "Spain" = c("Madrid", "Barcelona", "San Sebastian", "Lloret de Mar", 
              "Tossa de Mar", "Sevilla", "Granada", "Cordoba"),
  "Monaco" = c("Monaco"),
  "France" = c("Paris", "Carcassone", "Cannes", "Nice", "Biarritz"),
  "Poland" = c("Warsaw", "Cracow", "Gdansk", "Poznan", "Zakopane", "Katowice",
               "Torun", "Gdynia", "Sopot", "Kielce", "Rzeszow", "Radom", 
               "Kazimierz Dolny", "Jelenia Gora", "Sandomierz", "Kolobrzeg",
               "Swinoujscie", "Nowy Sacz", "Ustrzyki Gorne", "Hel", 
               "Jastarnia", "Krynica Zdroj", "Krynica Morska", "Leba",
               "Zywiec", "Gniezno", "Karpacz", "Szklarska Poreba", "Klodzko", 
               "Bielsko Biala", "Siedlce", "Miedzyzdroje", "Wladyslawowo",
               "Rowy", "Ustka", "Darlowo", "Mrzezyno", "Karwia", "Gizycko"),
  "Gibraltar" = c("Gibraltar"),
  "England" = c("London", "Oxford", "Canterbury", "Gloucester", "Bath",
                "Salisbury", "Warwick Castle", "Stonehenge", "Durham"),
  "Scotland" = c("Edinbourgh"),
  "Ireland" = c("Dublin", "Portalington", "Killarney", "Limerick", "Galway",
                "Cliffs of Moher"),
  "Belgium" = c("Brussels", "Antwerp", "Brugge", "Liege", "Spa", "Eupen", 
                "Malmedy"),
  "Netherlands" = c("Rotterdam", "Amsterdam", "Delft", "The Hague", "Dordrecht",
                    "Keukenhof", "Middelburg", "Breda", "Tilburg", "Eindhoven",
                    "Den Bosch", "Maastricht", "Drielandenpunt", "Gouda",
                    "Hoek van Holland", "Leiden", "Haarlem", "Utrecht",
                    "Volendam", "Groningen", "Gorinchem", "Hoge Veluwe",
                    "Kinderdijk", "Zaanse Schans"),
  "Germany" = c("Berlin", "Hamburg", "Munich", "Bremerhaven", "Frankfurt am Main",
                "Potsdam", "Helgoland", "Cuxhaven", "Karlsruhe", "Mainz", 
                "Wiesbaden", "Heringsdorf"),
  "Switzerland" = c("Zurich", "Lucerne"),
  "Austria" = c("Vienna"),
  "Italy" = c("Rome", "Milan", "Cesenatico", "Rimini", "Venice", "Bergamo",
              "Como", "Lecco", "Bellagio", "San Remo"),
  "San Marino" = c("San Marino"),
  "Vatican" = c("Vatican City"),
  "Croatia" = c("Dubrovnik"),
  "Montenegro" = c("Herceg Novi", "Kotor"),
  "Greece" = c("Athens", "Pireus"),
  "Bulgaria" = c("Sophia", "Samokov", "Borovets", "Musala"),
  "Romania" = c("Bucharest", "Contanta", "Vama Veche", "Mangalia", "Saturn",
                "Brasov", "Curta de Arges", "Sibiu", "Sigishoara", "Bran",
                "Victoria", "Moldoveanu", "Ucea", "Balea Lac", "Poenari"),
  "Hungary" = c("Budapest"),
  "Slovakia" = c("Zylina", "Stary Smokovec", "Kysucke Nove Mesto"),
  "Czech Republic" = c("Prague"),
  "Denmark" = c("Bornholm", "Copenhagen", "Koge", "Roskilde", "Frederikssund", 
                "Hundestad", "Liseleje", "Gilleleje", "Helsingor"),
  "Sweden" = c("Stockholm", "Ystad"),
  "Norway" = c("Stavanger", "Preikestolen", "Bergen", "Spiterstulen", "Trondheim",
               "Alesund", "Voss", "Flam"),
  "Iceland" = c("Reykjavik", "Vik i Myrdal", "Thorsmork", "Skogar", "Jokursarlon",
                "Skaftafell", "Egilsstadir", "Borgarfjordur Eystri", "Seydisfjordur",
                "Neskaupstadur", "Fellabaer", "Reydarfjordur", "Reyjahlid", 
                "Myvatn", "Akureyri", "Snaefell"),
  "Lithuania" = c("Vilnius", "Druskininkai", "Medininkai"),
  # North America -------------------------------------------------------------
  "United States" = c("Salt Lake City", "San Francisco, CA", "Mountain View, CA",
                      "Palo Alto, CA", "Yosemite National Park"),
  # Asia ----------------------------------------------------------------------
  "Japan" = c("Kyoto", "Nara", "Osaka", "Kobe", "Himeji"),
  "China" = c("Shanghai", "Chengdu"),
  "Thailand" = c("Bangkok", "Krabi", "Ko Lanta", "Ko Phi Phi"),
  "Gruzija" = c("Tbilisi", "Kutaisi", "Batumi", "Mestia", "Kazbegi",
                "Gergeti Trinity Church", "Juta", "Sighnaghi", "Vardzia"),
  "Cyprus" = c("Paphos", "Larnaca", "Nicosia", "Neo Chorio", "Limassol",
               "Troodos", "Girne"),
  # Africa --------------------------------------------------------------------
  "Morocco" = c("Marrakesh", "Ouarzazate", "Essaouira", "Meknes", "Fes", 
                "Ait Benhaddou", "Merzouga", "Imlil")
)

visited_with_country <- visited
for (country in names(visited)) {
  visited_with_country[[country]] <- paste0(visited_with_country[[country]],
                                            ", ", country) 
} 
plotdata <- visited_with_country %>% 
  unlist(use.names = FALSE) %>% 
  geocode(source = "dsk") %>% 
  mutate(place = unlist(visited_with_country))


plt <- ggplot(plotdata, aes(x = lon, y = lat, text = place)) + 
  borders("world", colour = "gray50", fill = "gray50") +
  geom_point(color = "darkorange", size = 1, alpha = 0.8) +
  ggtitle(paste0("Visited ", length(visited), " countries or territories")) +
  theme(axis.title = element_blank(),
        axis.text = element_blank(),
        axis.ticks = element_blank(),
        plot.title = element_text(hjust = 0.5, face = "bold"))

# ggplotly(plt, tooltip = "text")

ggsave("img/visited_places.png", plot = plt,
       height = 6, width = 12)
