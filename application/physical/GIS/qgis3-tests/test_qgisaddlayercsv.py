"""
This unittest for for QGIS 3 checks adding layers.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

#from qgis import *
from qgis.core import *


class TestQgisAddLayer(unittest.TestCase):

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

        try:
            os.environ["QT_QPA_PLATFORM"] = "offscreen"
            QgsApplication.setPrefixPath("/usr", False)
            self.qgs = QgsApplication([], False)
            self.qgs.initQgis()
        except:
            self.fail("cannot init qgis application")

    def tearDown(self):
        self.qgs.quit()

    def test_qgisnewprojecthasnolayers(self):
        project = QgsProject()
        self.assertFalse(project.mapLayers())  # an empty list [] is false

    def test_qgisnewprojecthasnolayers(self):
        project = QgsProject()
        project.setTitle("project with QGIS version " + str(self.qgis_version))
        self.assertTrue(project.isDirty())

    def test_qgisnewvectorlayer(self):
        vlayer_land = QgsVectorLayer(
            "./testdata/land/ne_10m_land.shp", 'land')  # , 'memory')
        self.assertTrue(vlayer_land.isValid())  # an empty list [] is false

    def test_qgisaddvectorlayer(self):
        project = QgsProject()
        vlayer_land = QgsVectorLayer(
            "./testdata/land/ne_10m_land.shp", 'land')  # , 'memory')
        project.addMapLayer(vlayer_land)
        self.assertTrue(project.mapLayers())  # an empty list [] is false

    def test_qgisaddtwovectorlayers(self):
        project = QgsProject()
        project.setTitle("foo")
        project.setFileName("test.qgs")
        vlayer_land = QgsVectorLayer("./testdata/land/ne_10m_land.shp", 'land')
        # project.addMapLayer(vlayer_land)
        vlayer_ocean = QgsVectorLayer(
            "./testdata/ocean/ne_10m_ocean.shp", 'ocean')
        # project.addMapLayer(vlayer_ocean)
        project.addMapLayers([vlayer_land, vlayer_ocean])
        self.assertTrue(len(project.mapLayers()) == 2)
        self.assertTrue(project.isDirty())


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
