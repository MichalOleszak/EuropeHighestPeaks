import plotly.express as px
import pandas as pd

been = pd.read_csv("swiss_peaks.csv")
been["name"] = been.name + ", " + been.elevation.astype(str) + " m" 

fig = px.scatter_mapbox(been, lat="lat", lon="lon", hover_name="name",
                        hover_data={"name": False, "lat": False, "lon": False, "elevation": False},
                        color_discrete_sequence=["darkorange"], zoom=7)
fig.update_layout(mapbox_style="stamen-terrain")
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})

fig.write_html("swiss_peaks.html")