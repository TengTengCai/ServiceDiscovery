#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 09:18
# @Author  : TengTengCai
# @File    : app.py
import logging

from flask import Flask
from flask.logging import default_handler
from flask_restful import Api

from routing import set_routing
from utils.kazoo_tool import KazooConn


def create_app():
    # 创建flask对象， 设置静态文件路径
    flask_app = Flask(__name__, static_url_path='/static')
    # 设置日志输出格式
    default_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(filename)s '
        '[%(funcName)s:%(lineno)d]: %(message)s'
    ))
    # 加载restful 模块
    api = Api(flask_app)
    # 初始化路由
    set_routing(flask_app, api)
    # 初始化zookeeper连接对象
    kazoo_conn = KazooConn.get_instance()
    # 创建zookeeper连接
    kazoo_conn.create_conn(hosts='127.0.0.1:2181')
    return flask_app


if __name__ == '__main__':
    # 创建Flask app对象
    app = create_app()
    app.run(debug=True)
