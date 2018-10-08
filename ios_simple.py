"""
Simple iOS tests, showing accessing elements and getting/setting text from them.
"""
import unittest
import os
from random import randint
from appiumclient import webdriver
# import webdriver
from time import sleep

class SimpleIOSTests(unittest.TestCase):

    def setUp(self):
        # set up appium

        # optional
        app = os.path.abspath('../../apps/TestApp/build/release-iphonesimulator/TestApp-iphonesimulator.app')

        self.driver = webdriver.Remote(
           command_executor='http://127.0.0.1:8121/wd/hub',
#             command_executor='http://10.94.51.43:8265/wd/hub',
            desired_capabilities={
                # 'bundleId':'com.baidu.BaiduMobile',
                'bundleId':'com.facebook.wda.integrationApp',
                'platformName':'IOS',
                'platformVersion':'9.3.2',
                'deviceName': 'iPhone5 slave15',
                'automationName':'XCUITest',
                'clearSystemFiles' : True,
                'udid':'12799f9ea66ddeb321f22939b1c97bf05d86c72c',
                'preventWDAAttachments':True
            })
    #
    # def tearDown(self):
    #     self.driver.quit()

    def _populate(self):

        # print self.driver.page_source
        # self.driver.swipe(100, 100, 100, 400);
        positions = [];
        positions.append((100, 200));
#

        self.driver.tap(positions)
        self.driver.tap(positions)
        self.driver.tap(positions)
        self.driver.tap(positions)
        self.driver.tap(positions)
        # self.driver.swipe(100, 100, 100, 400);
        # self.driver.swipe(200, 100, 300, 400);
        # self.driver.swipe(300, 100, 400, 400);
        # positions1 = [];
        # positions1.append((100, 200));

    def test_ui_computation(self):
        try:
            while (True):
                page_source = self.driver.get_ios_quick_source
                print page_source
                sleep(30)
        except Exception as e:
            raise e


#        try:
#            self._populate()
#
#    def test_ui_computation1(self):
#        # populate text fields with values
#        self._populate()
#    def test_ui_computation2(self):
#        # populate text fields with values
#        self._populate()
#    def test_ui_computation3(self):
#        # populate text fields with values
#        self._populate()

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(SimpleIOSTests)
    unittest.TextTestRunner(verbosity=2).run(suite)
