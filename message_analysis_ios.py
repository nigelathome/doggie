#!/usr/bin/env python
# -*- coding: utf-8 -*-
########################################################################
# 
# Copyright (c) 2016 Baidu.com, Inc. All Rights Reserved
# 
########################################################################
"""
message、phoneid错误统计脚本
"""
import traceback
import sys
import datetime
import xlwt
from collections import OrderedDict
# SQL_CONFIG = {
#    'host': '127.0.0.1',
#    'user': 'root',
#    'passwd': '12345678',
#    'db': 'cm',
#    'charset': 'utf8'
# }

class ToolsAnalysisClass(object):
    """
    通过查询sql语句获取对应toos id
    """
    def __init__(self):
        
        self.hashlist = {}
        self.month = datetime.datetime.now().month
        self.day = datetime.datetime.now().day
        self.endday = datetime.datetime.now().day
        if self.day < 10:
            self.day = '0' + str(self.day)
            self.endday = '0' + str(self.endday)
            self.month = '0' + str(self.month)
        self.starttime = '2018-05-05 00'
        self.endtime = '2018-05-06 00'

    def data_choose(self, num, hourstart, hourend):
        """
        日期函数
        """
        self.starttime = '2018-0%s-%s %s' % (self.month, self.day + num, hourstart)
        self.endtime = '2018-0%s-%s %s' % (self.month, self.endday, hourend)

    def strdiff(self, sqlarr):
        """
        字符串对比 字符串前10个字母完全一致 认为是一种报错
        hashlist {'cutkey':[key,message,contract_data,toos_id]}
        """
        message_tag = sqlarr[0]
        key = sqlarr[1]
        message = sqlarr[2]
        contract_data = sqlarr[3]
        toos_id = sqlarr[4]
        # if key != None:
        #     cutkey = key[0:10]
        # else:
        cutkey = key
        if self.hashlist.has_key(cutkey) == False:
            self.hashlist[cutkey] = [message_tag, key, message, contract_data, toos_id]
        else:
            self.hashlist[cutkey][2] += message
            self.hashlist[cutkey][3] = contract_data + ','
            if toos_id is not None:
                self.hashlist[cutkey][4] += toos_id

    def save_data(self, result, filename):
        value = OrderedDict()
        value['round'] = 'round'
        value['time'] = 'time'
        data = [value]
        for el in result:
            data.append(el)

        self.save_excel(data, filename)

    def save_excel(self, result, filename):
        """
        保存在excel中
        """
        file = xlwt.Workbook(encoding = 'utf-8')
      
        #指定file以utf-8的格d式打开  
        table = file.add_sheet('time')
        table.col(0).width = 1500 
        table.col(0).height = 9000  
        #字典数据  
  
        ldata = []  
        data = result
        for x in data:  
        #for循环将data字典中的键和值分批的保存在ldata中  
            t = [] 
            for a in x: #x 为{'content': u'RMTC', 'num': 1L} 需要将其中的value值单独提取出来
                t.append(x[a])  
            ldata.append(t) 
        for i, p in enumerate(ldata):  
        #将数据写入文件,i是enumerate()函数返回的序号数  
            for j, q in enumerate(p):  
                table.write(i, j, q)  
        file.save('%s.xls' % filename)     
   
      
if __name__ == '__main__':
    toos_analysis = ToolsAnalysisClass()
    if len(sys.argv) > 2:
        toos_analysis.starttime = sys.argv[1]
        toos_analysis.endtime = sys.argv[2]
    else:
        toos_analysis.data_choose(-1, '00', '00')
    # print toos_analysis.starttime, toos_analysis.endtime
    # toos_analysis.get_message(1)#8台设备
    # toos_analysis.get_message(2)
    # toos_analysis.get_message(3)
    toos_analysis.save_data([{1: 1, 2: 2}, {1: 1, 2: 2}], "record")


