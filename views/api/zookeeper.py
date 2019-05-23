#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 13:47
# @Author  : TengTengCai
# @File    : zookeeper.py
import logging

from flask import request
from flask.logging import default_handler
from flask_restful import Resource

from utils.kazoo_tool import KazooConn

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(default_handler)


class ZookeeperPath(Resource):
    def get(self):
        kazoo_conn = KazooConn.get_instance()
        data = kazoo_conn.get_all_nodes()
        return data

    def post(self):
        path = request.form.get('path', '/')
        try:
            zkc = KazooConn.get_instance().zkc
            zkc.create(path)
        except Exception as e:
            logger.error(e)
            return {
                'status': 1,
                'msg': 'fail',
            }
        return {
            'status': 0,
            'msg': 'success',
        }

    def put(self):
        pass

    def delete(self):
        pass

