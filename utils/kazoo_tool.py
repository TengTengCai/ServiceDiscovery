#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 10:24
# @Author  : TengTengCai
# @File    : kazoo_tool.py
import logging

from flask.logging import default_handler
from kazoo.client import KazooClient
from kazoo.protocol.states import KazooState

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(default_handler)

ROOT_PATH = '/platform'


class KazooConn(object):
    """
    kazoo连接对象
    目前是单例模式，后期如果涉及到用户的登录注册可修改为工厂模式创建不同权限的kazoo连接，
    然后将对应的连接对象存入相关用户的session中进行缓存，当用户需要使用时从session中取出对象。
    """
    __instance = None
    __zk = None

    @staticmethod
    def get_instance():
        """ Static access method. """
        if KazooConn.__instance is None:
            KazooConn()
        return KazooConn.__instance

    def __init__(self):

        """ Virtually private constructor. """
        if KazooConn.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            KazooConn.__instance = self

    def create_conn(self, hosts):
        """
        创建连接的方法

        :param hosts:
        :return:
        """
        # TODO: 添加zookeeper的Access Control List
        self.__zk = KazooClient(hosts=hosts)
        self.__zk.add_listener(kazoo_conn_listener)
        self.__zk.start(timeout=30)
        if self.__zk.exists(ROOT_PATH) is None:
            self.__zk.create(ROOT_PATH)
        if not self.__zk.connected:
            # Not connected, stop trying to connect
            self.close_conn()
            raise Exception("Unable to connect.")

    @property
    def zkc(self):
        """
        获取kazoo连接方法

        :return:
        """
        if self.__zk is None:
            raise Exception("Please create a connection first!")
        return self.__zk

    def close_conn(self):
        """
        关闭当前kazoo的连接
        :return:
        """
        self.__zk.stop()

    def get_all_nodes(self, path):
        """
        获取当前节点所有的子孙节点

        :param path:
        :return:
        """
        if not self.__zk.exists(path):
            raise Exception("The node you are looking for does not exist!")
        _, stat = self.__zk.get(path)
        path_name = str(path).split('/')[-1]
        node = {
            'pId': 0,
            'id': stat.czxid,
            'name': path_name,
            'open': True,
        }
        p_id = stat.czxid
        level = 0
        node_list = [node]
        node_list = self.get_child_node(path, p_id, level, node_list)
        return node_list

    def get_child_node(self, path, p_id, level, node_list):
        """
        递归遍历，获取子孙节点

        :param path: 路径
        :param p_id: 节点的创建id
        :param level: 节点深度
        :param node_list: 节点列表
        :return:
        """
        level += 1
        if level > 3:
            return node_list
        children = self.__zk.get_children(path)
        for child in children:
            child_path = '{}/{}'.format(path, child)
            _, stat = self.__zk.get(child_path)
            node = {
                'pId': p_id,
                'id': stat.czxid,
                'name': child,
                'open': True,
            }
            node_list.append(node)
            if stat.numChildren == 0:
                continue
            node_list = self.get_child_node(child_path,
                                            stat.czxid,
                                            level,
                                            node_list)
        return node_list


def kazoo_conn_listener(state):
    """
    连接状态监听

    :param state:
    :return:
    """
    if state == KazooState.LOST:
        # Register somewhere that the session was lost
        logger.info('Register somewhere that the session was lost.')
    elif state == KazooState.SUSPENDED:
        # Handle being disconnected from Zookeeper
        logger.info('Handle being disconnected from Zookeeper.')
    else:
        # Handle being connected/reconnected to Zookeeper
        logger.info('Handle being connected/reconnected to Zookeeper.')
