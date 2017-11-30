"""
This unittest for QGIS 3 checks if QgsProject can be properly instantiated and the method setTitle() be used.
Usage of this class is crucial because as https://qgis.org/api/api_break.html states:
> QgsMapLayerRegistry. Its functionality has been moved to QgsProject.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

from qgis.core import *


class TestQgisProject(unittest.TestCase):

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

    def test_qgisprojectinstance(self):
        try:
            self.project = QgsProject.instance()
        except:
            self.fail("boo")

    def test_qgisprojectsettitle(self):
        try:
            self.project = QgsProject.instance()
            self.project.setTitle("unittest")
        except:
            self.fail("Could not set title")

    def test_qgisprojecttitle(self):
        self.project = QgsProject.instance()
        self.project.setTitle("unittest")
        self.assertEqual(self.project.title(), "unittest",
                         msg="setTitle was not successfully retrieved back.")


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
