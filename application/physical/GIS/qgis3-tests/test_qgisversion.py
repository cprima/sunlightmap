"""
This unittest for Python2 and Python3 checks if a QGIS installation if found
- that is newer than 21800 (or a supplied ENV['PYQGISUT_MINVERSION'])
- that is not younger than than 30999 (or a supplied ENV['PYQGISUT_MAXVERSION'])
"""

import os
# import sys # @todo: setUp with an environment variable for PYTHONPATH
import unittest

from qgis.core import *


class TestQgisVersion(unittest.TestCase):

    def setUp(self):
        if 'PYQGISUT_MINVERSION' in os.environ:
            self.min_version = int(os.environ['PYQGISUT_MINVERSION'])
        else:
            self.min_version = 21800
        if 'PYQGISUT_MAXVERSION' in os.environ:
            self.max_version = int(os.environ['PYQGISUT_MAXVERSION'])
        else:
            self.max_version = 30999

        #print(self.min_version, self.max_version)

        try:
            self.qgis_version = QGis.QGIS_VERSION_INT
        except NameError:
            self.qgis_version = Qgis.QGIS_VERSION_INT
        except:
            self.fail("cannot get QGIS_VERSION_INT")

        # print(self.qgis_version)

    def test_versioninteger(self):
        """
        Procedure:
        1. Is qgis.core.Q[Gg]is.QGIS_VERSION_INT >= the supplied min version?
        2. Is qgis.core.Q[Gg]is.QGIS_VERSION_INT <= the supplied max version?
        """
        self.assertGreaterEqual(
            self.qgis_version, self.min_version, msg="QGIS too old.")
        self.assertLessEqual(self.qgis_version, 30999,
                             msg="QGIS not ne enough.")


if __name__ == '__main__':
    unittest.main(exit=False, verbosity=1)  # as of Python 2.7
