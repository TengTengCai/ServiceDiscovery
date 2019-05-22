#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 13:47
# @Author  : TengTengCai
# @File    : zookeeper.py
import logging

from flask.logging import default_handler
from flask_restful import Resource

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(default_handler)

ROOT_PATH = '/platform'


class ZookeeperPath(Resource):
    def get(self):
        path = '{}/{}/{}/{}'.format(ROOT_PATH, env, app, version)
        logger.debug((env, app, version))
        return {'hello': 'world'}


