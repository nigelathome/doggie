#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Copyright (c) 2017 Baidu.com, Inc. All Rights Reserved
#

"""
@author: lihui40
@contract: lihui40@baidu.com
@file: record_info_randw.py
@time: 2018/3/26 下午7:55
@desc:
"""

import traceback
import os
import json


class WritebackAndReadExecutorInfoHandler(object):
    """用于读写job执行时间，是否需要从被打断时间进行执行的类"""
    def __init__(self):
        print "================="

    def do_writeback_action(self, interrupted_value=False, config_execute_time_sec_value=0):
        """
        写入本地文件，记录相关的属性
        :return:
        """
        print "i am writing, leave me alone!"
        try:
            info_dict = {}
            info_dict["round"] = interrupted_value
            info_dict["time"] = config_execute_time_sec_value

            json_str = json.dumps(info_dict)
            cur_path = os.path.abspath('.')
            record_file_path = "%s/record.json" % cur_path
            with open(record_file_path, "a") as record_file:
                json.dump(json_str, record_file)
        except Exception as e:
            print e

    def do_read_action(self, key):
        """
        读取本地文件，获取相关的key值
        :return:
        """
        print "i am reading, do not annoy me!"
        try:
            cur_path = os.path.abspath('.')
            record_file_path = "%s/execute_info_record.json" % cur_path
            with open(record_file_path, "r") as record_file:
                record_info = json.loads(json.load(record_file))
                key_value = record_info.get(key)
                print key_value

            return key_value
        except Exception as e:
            print e


if __name__ == '__main__':
    i_can_write_and_read = WritebackAndReadExecutorInfoHandler()
    i_can_write_and_read.do_writeback_action(True, 7200)
    # i_can_write_and_read.do_read_action("config_execute_time_sec")
    i_can_write_and_read.do_read_action("interrupted")
