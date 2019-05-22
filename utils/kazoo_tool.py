#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 10:24
# @Author  : TengTengCai
# @File    : kazoo_tool.py
import logging

from flask.logging import default_handler
from kazoo.client import KazooClient
from kazoo.handlers.gevent import SequentialGeventHandler
from kazoo.protocol.states import KazooState

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(default_handler)


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


def create_kazoo_client():
    """
    创建一个kazoo的客户端

    :return:
    """
    # TODO: 添加zookeeper的Access Control List
    zk = KazooClient(hosts='127.0.0.1:2181', handler=SequentialGeventHandler())
    zk.add_listener(kazoo_conn_listener)
    event = zk.start_async()
    event.wait(timeout=30)
    if not zk.connected:
        # Not connected, stop trying to connect
        zk.stop()
        raise Exception("Unable to connect.")
    return zk



