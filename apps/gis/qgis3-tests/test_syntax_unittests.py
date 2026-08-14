import sys
import unittest


# Syntax example
# sys.path.append("../")
# sys.path.append("../../")
#from core.parser import CommandParser


# def suite():
#     tests = ['test_exitfunc']

#     return unittest.TestSuite(map(TestSyntax, tests))

# def suite():
#     suite = unittest.TestSuite()
#     suite.addTest(TestSyntax('test_exitfunc'))
#     suite.addTest(TestStringMethods('test_upper'))
#     # suite.addTest(TestStringMethods('test_isupper'))
#     suite.addTest(TestStringMethods('test_split'))
#     return suite


class TestSyntax(unittest.TestCase):

    @classmethod
    def setUpClass(self):
        pass

    @classmethod
    def tearDownClass(self):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    # https://stackoverflow.com/questions/27690278/unittest-failed-with-sys-exit
    def test_exitfunc(self):
        with self.assertRaises(SystemExit):
            sys.exit(0)


class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)


if __name__ == '__main__':
    # Python 2.6 @see https://stackoverflow.com/a/21262077 or if sys.version_info >= (3,): et al
    # uses the built-in runner printing to stderr
    # see https://docs.python.org/2/library/unittest.html#unittest.TextTestRunner
    unittest.main(exit=False, verbosity=2)  # as of Python 2.7
