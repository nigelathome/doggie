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
import MySQLdb as mdb
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
SQL_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'passwd': 'monkey@123',
    'db': 'dispatcher_ep_new',
    'charset': 'utf8'
}
phone_id_tw = 'tr.phone_id in (2548,2675,2669,2983,2954,2955,2989,3070,2667,2601,2645,2619,2014,2052,2486,2977,2578,2691,3011,3243) and'

#phone_id_eight = 'tr.phone_id in (2052,2669,2095,2983,2469,3070,2977,3243) and'
phone_id_eight = 'tr.phone_id in (2052,3243,3244,3248,3268,3283,2469,2548,2578,2601,2631,2645,2667,2675,2954,2955,2989,2998,3003,3011,2014,3070,2040,2043,2577,2596) and'
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

    def get_message(self, typestr):
        """
        连接数据库 按照message层级对信息进行分类
        """
        filename = 'data'
        if typestr == 1:
            phone_id = phone_id_eight#8台优选设备
            filename = 'data8'
        elif typestr == 2:
            phone_id = phone_id_tw#20台专属设备
        else:
            phone_id = ''
            filename = 'dataall'
        value=OrderedDict()
        value['message_tag'] = 'task_id'
        value['content'] = 'phone_id'
        value['num'] = 'contract_data'
        value['contract'] = 'create_time'
        value['toos_id'] = 'message_tag'
        data = [value]
        """
        获取当日全部任务toosid
        """   
        # sql = 'select tr.task_id, tr.message, count(*), group_concat(tr.phone_id), group_concat(tr.contract_data) from  device_fail_message as tr where  {}   tr.time  >= \'{}\'  and tr.time <= \'{}\' group by  tr.message ;'.format(phone_id, self.starttime, self.endtime)
        sql = 'select tm.task_id, tm.phone_id, tm.contract_data, tm.create_time, tm.message_tag from ios_task_message tm left join ios_job_info ji using (job_id) left join job j using(job_id) left join ep_task et using(task_id) left join ios_task_result tr using (task_id) where tm.create_time > \'2018-07-11 00:00:00\' and tm.message_tag="FAIL";'
        
        print sql
        conn = mdb.connect(**SQL_CONFIG)

        try:
            cursor = conn.cursor()
            cursor.execute(sql)
            all_tags = cursor.fetchall()
            tags = []
            for tags_tuple in all_tags:
                self.strdiff([tags_tuple[0], tags_tuple[1], tags_tuple[2], tags_tuple[3], tags_tuple[4]])
            for i in self.hashlist:
                value=OrderedDict()
                value['task_id'] = self.hashlist[i][0]
                value['phone_id'] = self.hashlist[i][1]
                value['contract_data'] = self.hashlist[i][2]
                value['create_time'] = self.hashlist[i][3]
                value['message_tag'] = self.hashlist[i][4]
                data.append(value)
            self.save_excel(data, filename)
        except:
            traceback.print_exc()
        finally:
            conn.close()

    def get_message_by_phone_id(self, typestr):
        """
        连接数据库 按照phone_id层级对信息进行归类
        """
        filename = 'iosphone'
        value=OrderedDict()
        # value['message_tag'] = '报错种类'
        value['task_id'] = 'task_id'
        value['phone_id'] = 'phone_id'
        value['contract_data'] = 'contract_data'
        value['create_time'] = 'create_time'
        value['toos_id'] = 'toos_id'
        data = [value]
        """
        获取当日全部任务toosid
        """   
        # sql = 'select  tr.phone_id, count(*), group_concat(tr.message), group_concat(tr.contract_data) from  device_fail_message as tr where  {}   tr.time  >= \'{}\'  and tr.time <= \'{}\' group by  tr.phone_id ;'.format('', self.starttime, self.endtime)
        sql = 'select tm.task_id, tm.phone_id, tm.contract_data, tm.create_time, tm.toos_id from ios_task_message tm left join ios_job_info ji using (job_id) left join job j using(job_id) left join ep_task et using(task_id) left join ios_task_result tr using (task_id) where tm.create_time >= \'{}\' and tm.create_time <= \'{}\' and tm.message_tag="FAIL";'.format(self.starttime, self.endtime)
        
        print sql
        conn = mdb.connect(**SQL_CONFIG)

        try:
            cursor = conn.cursor()
            cursor.execute(sql)
            all_tags = cursor.fetchall()
            for i in all_tags:
                value=OrderedDict()
                value['task_id'] = i[0]
                value['phone_id'] = i[1]
                value['contract_data'] = i[2]
                value['create_time'] = i[3]
                value['toos_id'] = i[4]
                data.append(value)
            self.save_excel(data, filename) 
        except:
            traceback.print_exc()
        finally:
            conn.close()

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

    def save_excel(self, result, filename):
        """
        保存在excel中
        """
        file = xlwt.Workbook(encoding = 'utf-8')
      
        #指定file以utf-8的格d式打开  
        table = file.add_sheet('data') 
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
    toos_analysis.get_message_by_phone_id(1)

