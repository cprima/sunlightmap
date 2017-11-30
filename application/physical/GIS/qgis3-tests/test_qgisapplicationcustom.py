"""
This unittest for QGIS 3 checks working with the application.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

# import qgis
from qgis.core import *


class TestQgisApplicationCustom(unittest.TestCase):

    def tearDown(self):
        # coredumps self.qgs.exitQgis()
        pass

    def setUp(self):
        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        if self.qgis_version < 29900:
            self.fail("unittest for QGIS 3 and higher only.")

        # users of PhantomJS also report the error
        # QXcbConnection: Could not connect to display
        # which currently as of 2.9900 coredumps
        # see http://doc.qt.io/qt-5/embedded-linux.html
        # >Since the Qt 5.0 release, Qt no longer contains its own window system (QWS) implementation.
        os.environ["QT_QPA_PLATFORM"] = "offscreen"
        try:
            QgsApplication.setPrefixPath("/usr", False)
            self.qgscustom = QgsApplication(
                [], False, os.path.abspath('./testdata/profiles/testing'))
            self.qgscustom.initQgis()
            # qgs.exitQgis()  # todo move to setup und tearDown
        except:
            self.fail("could not initQgis() application")

    def test_qgisapplicationplatformcustom(self):
        self.assertIn(self.qgscustom.platform(), ['desktop', 'server'])

    def test_qgispkgdatapathcustom(self):
        # fixme? this is ubuntugis-nightly
        self.assertEqual(self.qgscustom.pkgDataPath(), '/usr/share/qgis')

    def test_qgissettingsdirpathcustom(self):
        self.assertEqual(self.qgscustom.qgisSettingsDirPath(),
                         os.path.abspath('./testdata/profiles/testing') + '/')

    def test_qgisuserdatabasepathcustom(self):
        self.assertEqual(self.qgscustom.qgisUserDatabaseFilePath(),
                         os.path.abspath('./testdata/profiles/testing') + '/qgis.db')


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
