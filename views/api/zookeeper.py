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

FAIL_STATUS = {
    'status': 0,
    'msg': 'fail'
}
SUCCESS_STATUS = {
    'status': 1,
    'msg': 'success'
}


class ZookeeperPath(Resource):
    """
    zookeeper路径的增删改查方法

    """
    def get(self, path):
        """
        获取路径对应的所有子孙节点

        :param path: 路径 以','连接 如 "platform,dev,gateway"
        :return:
        """
        path = '/'.join(path.split(','))
        path = '/' + path
        try:
            kazoo_conn = KazooConn.get_instance()
            data = kazoo_conn.get_all_nodes(path)
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return data

    def post(self, path):
        """
        添加对应的path

        :param path: 路径 以','连接 如 "platform,dev,gateway"
        :return:
        """
        # path = request.form.get('path', None)
        if len(path.split(',')) > 4:
            return FAIL_STATUS
        path = '/'.join(path.split(','))
        path = '/' + path
        logger.info(path)
        if path is None:
            return FAIL_STATUS
        try:
            zkc = KazooConn.get_instance().zkc
            zkc.create(path)
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS

    # 修改节点名称会导致子节点的丢失，暂时只允许业主节点修改名称
    def put(self, path):
        """
        修改叶子节点的名称

        :param path: 路径 以','连接 如 "platform,dev,gateway"
        :return:
        """
        new_name = request.form.get('newName', None)
        if new_name is None:
            logger.info("The newName parameter is empty！")
            return FAIL_STATUS
        path_arr = path.split(',')
        new_path_arr = path_arr.copy()
        new_path_arr = new_path_arr[:-1] + [new_name]
        path = '/'.join(path_arr)
        path = '/' + path
        new_path = '/'.join(new_path_arr)
        new_path = '/' + new_path
        try:
            zkc = KazooConn.get_instance().zkc
            if zkc.exists(path) is None:
                logger.info(
                    "The path that needs to be modified does not exist!")
                return FAIL_STATUS
            if zkc.exists(new_path):
                logger.info("The new path already exists!")
                return FAIL_STATUS
            _, stat = zkc.get(path)
            if stat.numChildren > 0:
                logger.info(
                    "The path also has a subpath, "
                    "and the name modification failed!")
                return FAIL_STATUS
            transaction = zkc.transaction()
            transaction.create(new_path, b'')
            transaction.delete(path)
            transaction.commit()
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS

    def delete(self, path):
        """
        删除叶子节点

        :param path: 路径 以','连接 如 "platform,dev,gateway"
        :return:
        """
        path = '/'.join(path.split(','))
        path = '/' + path
        try:
            zkc = KazooConn.get_instance().zkc
            zkc.delete(path, recursive=True)
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS


class ZookeeperValue(Resource):
    def get(self, path):
        path = '/'.join(path.split(','))
        path = '/' + path
        node_list = []
        try:
            zkc = KazooConn.get_instance().zkc
            if zkc.exists(path):
                _, stat = zkc.get(path)
                if stat.numChildren == 0:
                    return node_list
                children = zkc.get_children(path)
                for child in children:
                    data, _ = zkc.get(path+'/'+child)
                    node = {
                        'key': child,
                        'value': data.decode("utf-8")
                    }
                    node_list.append(node)
            else:
                return FAIL_STATUS
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return node_list

    def post(self, path):
        path = '/'.join(path.split(','))
        path = '/' + path
        key = request.form.get('key', None)
        value = request.form.get('value', None)
        if key is None or value is None:
            return FAIL_STATUS
        try:
            zkc = KazooConn.get_instance().zkc
            if zkc.exists(path) is None:
                return FAIL_STATUS
            new_path = path + '/' + key
            real_path = zkc.create(new_path, value.encode('utf-8'))
            logger.info("{} have created!".format(real_path))
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS

    def put(self, path):
        """
        修改配置

        :param path:
        :return:
        """
        # TODO: 如果有版本控制的话，还需要进行节点备份
        older_key = path.split(',')[-1]
        path = '/'.join(path.split(','))
        path = '/' + path
        key = request.form.get('key', None)
        value = request.form.get('value', None)
        if key is None or value is None:
            return FAIL_STATUS
        try:
            zkc = KazooConn.get_instance().zkc
            if zkc.exists(path) is None:
                return FAIL_STATUS
            if older_key == key:
                zkc.set(path, value.encode('utf-8'))
            else:
                i = str(path).rfind('/')
                new_path = path[:i] + '/' + key
                transaction = zkc.transaction()
                transaction.create(new_path, value.encode('utf-8'))
                transaction.delete(path)
                transaction.commit()
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS

    def delete(self, path):
        path = '/'.join(path.split(','))
        path = '/' + path
        try:
            zkc = KazooConn.get_instance().zkc
            zkc.delete(path, recursive=True)
        except Exception as e:
            logger.error(e)
            return FAIL_STATUS
        return SUCCESS_STATUS
