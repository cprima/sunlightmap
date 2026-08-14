from PyQt4.QtCore import *
from PyQt4.QtGui import *
from qgis.core import *

# to be used inside the Python console
# does not reproject, does not render text and does not render raster layers
# does not lint
# but makes clear-cut borders

myextent = QgsRectangle(-179.999, -89.999, 179.999, 89.999)
# myextent = QgsRectangle (-179.999,-85, 179.999, 85)

crs = QgsCoordinateReferenceSystem()
crs = QgsCoordinateReferenceSystem(
    54004, QgsCoordinateReferenceSystem.EpsgCrsId)

renderer = QgsMapRenderer()
renderer.setDestinationCrs(crs)
renderer.setProjectionsEnabled(True)
layers = QgsMapLayerRegistry.instance().mapLayers()
lst = layers.keys()
renderer.setLayerSet(lst)
renderer.setExtent(myextent)

layers = iface.mapCanvas().layers()

masterlayer = QgsMapLayerRegistry.instance().mapLayersByName(
    "10m_admin_0_scale_ranks_with_minor_islands")[0]


# crs = QgsCoordinateReferenceSystem()
# crs.createFromProj4("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs")
# crs.createFromProj4("+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs")
# crs = QgsCoordinateReferenceSystem(54004, QgsCoordinateReferenceSystem.EpsgCrsId)
# 54004
# 3395

p = QPainter()

img = QImage(QSize(720, 360), QImage.Format_ARGB32_Premultiplied)
img.fill(QColor(255, 255, 255).rgb())
p.begin(img)
p.setRenderHint(QPainter.Antialiasing)
renderer.setOutputSize(img.size(), img.logicalDpiX())
renderer.render(p)
p.end()
img.save("render.png", "png")
