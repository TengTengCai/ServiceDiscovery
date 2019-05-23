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
SERVICE_DISCOVERY_CONFIG_PATH = '/serviceDiscovery/config'
MAX_ID_PATH = SERVICE_DISCOVERY_CONFIG_PATH+'/maxId'


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
        logger.info(self.zk.exists(SERVICE_DISCOVERY_CONFIG_PATH))
        if not self.zk.connected:
            # Not connected, stop trying to connect
            self.close_conn()
            raise Exception("Unable to connect.")
        if self.zk.exists(SERVICE_DISCOVERY_CONFIG_PATH):
            self.zk.create(SERVICE_DISCOVERY_CONFIG_PATH)

    @property
    def zkc(self):
        if self.zk is None:
            raise Exception("Please create a connection first!")
        return self.zk

    def close_conn(self):
        self.zk.stop()

    def get_all_nodes(self):
        if not self.zk.exists(ROOT_PATH):
            self.zk.create(ROOT_PATH)
        _, stat = self.zk.get(ROOT_PATH)
        node = {
            'pId': 0,
            'id': stat.czxid,
            'name': ROOT_PATH.replace('/', ''),
            'open': True,
        }
        p_id = stat.czxid
        level = 0
        node_list = [node]
        node_list = self.get_child_node(ROOT_PATH, p_id, level, node_list)
        return node_list

    def get_child_node(self, path, p_id, level, node_list):
        level += 1
        if level > 3:
            return node_list
        children = self.zk.get_children(path)
        logger.info(children)
        for child in children:
            path = '{}/{}'.format(path, child)
            _, stat = self.zk.get(path)
            node = {
                'pId': p_id,
                'id': stat.czxid,
                'name': child,
                'open': True,
            }
            node_list.append(node)
            if stat.numChildren == 0:
                continue
            node_list = self.get_child_node(ROOT_PATH, p_id, level, node_list)
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
