"""
This unittest for for QGIS 3 checks working with coordinate reference systems.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest
from unittest.mock import mock_open

from qgis.core import *


class TestQgisCoordinateReferenceSystemDefault(unittest.TestCase):

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

    def test_qgiscrs(self):
        try:
            self.crs = QgsCoordinateReferenceSystem()
        except:
            self.fail("boo")

    def test_qgiscrsproj4(self):
        try:
            self.crs = QgsCoordinateReferenceSystem()
            self.crs.createFromProj4(
                "+proj=ortho +lat_0=20 +lon_0=20 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs")
        except:
            self.fail("Could not set crs from proj4")

    def test_qgiscrsproj4valid(self):
        self.crs = QgsCoordinateReferenceSystem()
        self.crs.createFromProj4(
            "+proj=ortho +lat_0=20 +lon_0=20 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs")
        self.assertTrue(self.crs.isValid(),
                        msg="crs created from Proj4 was not valid.")


class TestQgisCoordinateReferenceSystemCustom(unittest.TestCase):

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

        os.environ["QT_QPA_PLATFORM"] = "offscreen"
        try:
            QgsApplication.setPrefixPath("/usr", False)
            self.qgscustom = QgsApplication(
                [], False, os.path.abspath('./testdata/profiles/testing'))
            self.qgscustom.initQgis()
            # qgs.exitQgis()  # todo move to setup und tearDown
        except:
            self.fail("could not initQgis() application")

    def test_qgisuserdatabasepathcustom2(self):
        self.assertEqual(self.qgscustom.qgisUserDatabaseFilePath(),
                         os.path.abspath('./testdata/profiles/testing') + '/qgis.db')

    def test_qgiscrssaveasusercrs(self):
        self.crs = QgsCoordinateReferenceSystem()
        self.crs.createFromProj4(
            "+proj=ortho +lat_0=20 +lon_0=20 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +to_meter=1.0 +no_defs")
        srsid = self.crs.findMatchingProj()  # 0 if not found
        if srsid == 0:
            self.crs.saveAsUserCrs("ortho_20-20")
        # print(self.crs.bounds())
        self.crs.invalidateCache()
        self.assertTrue(self.crs.isValid(),
                        msg="crs created from Proj4 was not valid.")
        self.assertEqual(self.crs.mapUnits(), 0,
                         msg="mapUnits was not found to be meters")  # 0=meters
        self.assertEqual(self.crs.projectionAcronym(), 'ortho',
                         msg="projectionAcrynom was not found to be ortho")


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
