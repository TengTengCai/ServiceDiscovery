#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 09:26
# @Author  : TengTengCai
# @File    : routing.py
import views
from views.api.helloworld import HelloWorld
from views.api.zookeeper import ZookeeperPath, ZookeeperValue


def set_routing(app, api):
    # 页面路由
    app.add_url_rule('/', 'index', views.index)

    # api路由
    api.add_resource(HelloWorld, '/v1/hello_world')
    api.add_resource(ZookeeperPath,
                     '/v1/zookeeperPath/<string:path>/',
                     endpoint="zookeeperPath")
    api.add_resource(ZookeeperValue,
                     '/v1/zookeeperValue/<string:path>/',
                     endpoint="zookeeperValue")
