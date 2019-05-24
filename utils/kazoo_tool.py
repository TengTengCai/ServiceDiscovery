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
    __instance = None

    @staticmethod
    def get_instance():
        """ Static access method. """
        if KazooConn.__instance is None:
            KazooConn()
        return KazooConn.__instance

    def __init__(self):
        self.zk = None
        """ Virtually private constructor. """
        if KazooConn.__instance is not None:
            raise Exception("This class is a singleton!")
        else:
            KazooConn.__instance = self

    def create_conn(self, hosts):
        # TODO: 添加zookeeper的Access Control List
        self.zk = KazooClient(hosts=hosts)
        self.zk.add_listener(kazoo_conn_listener)
        self.zk.start(timeout=30)
        if not self.zk.connected:
            # Not connected, stop trying to connect
            self.close_conn()
            raise Exception("Unable to connect.")

    @property
    def zkc(self):
        if self.zk is None:
            raise Exception("Please create a connection first!")
        return self.zk

    def close_conn(self):
        self.zk.stop()

    def get_all_nodes(self, path):
        if not self.zk.exists(path):
            raise Exception("The node you are looking for does not exist!")
        _, stat = self.zk.get(path)
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
        level += 1
        if level > 3:
            return node_list
        children = self.zk.get_children(path)
        for child in children:
            child_path = '{}/{}'.format(path, child)
            _, stat = self.zk.get(child_path)
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
    if state == KazooState.LOST:
        # Register somewhere that the session was lost
        logger.info('Register somewhere that the session was lost.')
    elif state == KazooState.SUSPENDED:
        # Handle being disconnected from Zookeeper
        logger.info('Handle being disconnected from Zookeeper.')
    else:
        # Handle being connected/reconnected to Zookeeper
        logger.info('Handle being connected/reconnected to Zookeeper.')
