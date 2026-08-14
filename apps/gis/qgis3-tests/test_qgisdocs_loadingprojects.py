"""
This unittest for QGIS 3 checks if QgsProject can be properly instantiated and the method setTitle() be used.
Usage of this class is crucial because as https://qgis.org/api/api_break.html states:
> QgsMapLayerRegistry. Its functionality has been moved to QgsProject.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

from qgis.core import *
#from PyQt5.QtCore import QFileInfo


class TestQgisDocsLoadingProjects(unittest.TestCase):

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

        if not os.path.exists('./testdata'):
            os.makedirs('./testdata')

    def test_qgisdocs_noprojectloaded(self):
        project = QgsProject.instance()
        self.assertEqual(project.fileName(), '')

    def test_qgisdocs_saveproject(self):
        try:
            os.remove('./testdata/qgisdocs_saveproject.ggs')
        except OSError:
            pass

        project = QgsProject.instance()
        project.setTitle("unittest")
        project.setFileName('./testdata/qgisdocs_saveproject.ggs')
        success = project.write('./testdata/qgisdocs_saveproject.ggs')

        self.assertTrue(success, msg="could not write file successfully")
        self.assertEqual(project.fileName(),
                         './testdata/qgisdocs_saveproject.ggs', msg="setting the filename did not match")

    @unittest.skip("unit test case (sic!) not implemented yet")
    def test_qgisdocs_canvasbridge(self):
        pass


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
