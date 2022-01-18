import plotly.express as px
import pandas as pd

been = pd.read_csv("been.csv")

fig = px.scatter_mapbox(been, lat="lat", lon="lon", hover_name="place",
                        hover_data={"place": False, "lat": False, "lon": False},
                        color_discrete_sequence=["darkorange"], zoom=2)
fig.update_layout(mapbox_style="carto-positron")
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})

fig.write_html("been.html")