import os
from qgis.core import *

os.environ["QT_QPA_PLATFORM"] = "offscreen"

QgsApplication.setPrefixPath("/usr", False)
qgs = QgsApplication([], False)
qgs.initQgis()

print(qgs.qgisSettingsDirPath())

qgs.exitQgis()
