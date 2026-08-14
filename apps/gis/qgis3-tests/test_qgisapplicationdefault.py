"""
This unittest for QGIS 3 checks working with the application.
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

# import qgis
from qgis.core import *


class TestQgisApplicationDefault(unittest.TestCase):

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
            self.qgs = QgsApplication([], False)
            self.qgs.initQgis()
            # qgs.exitQgis()  # todo move to setup und tearDown
        except:
            self.fail("could not initQgis() application")

    def test_qgisapplicationplatform(self):
        self.assertIn(self.qgs.platform(), ['desktop', 'server'])

    def test_qgispkgdatapath(self):
        # fixme? this is ubuntugis-nightly
        self.assertEqual(self.qgs.pkgDataPath(), '/usr/share/qgis')

    def test_qgissettingsdirpath(self):
        self.assertEqual(self.qgs.qgisSettingsDirPath(),
                         os.path.expanduser('~/.local/share/QGIS/QGIS3/profiles/default'))  # todo check bug

    def test_qgisuserdatabasepath(self):
        self.assertEqual(self.qgs.qgisUserDatabaseFilePath(),
                         os.path.expanduser('~/.local/share/profiles/default/qgis.db'))

    def test_qgisauthsrsbasefilepath(self):
        self.assertEqual(self.qgs.srsDatabaseFilePath(),
                         '/usr/share/qgis/resources/srs.db')

    def test_qgisuserstylepath(self):
        self.assertEqual(self.qgs.userStylePath(),
                         os.path.expanduser('~/.local/share/profiles/default/symbology-style.db'))

    def test_qgisuserthemesfolder(self):
        self.assertEqual(self.qgs.userThemesFolder(),
                         self.qgs.qgisSettingsDirPath() + '/themes')  # todo check bug

    # def test_qgissvgpaths(self):
    #    for path in self.qgs.svgPaths():
    #        self.assertIn(path, [
    #            '/usr/share/qgis/svg/', os.path.expanduser('~/.local/share/profiles/default/svg/')])


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)
