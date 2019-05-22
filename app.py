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
from utils.kazoo_tool import create_kazoo_client


def create_app():
    flask_app = Flask(__name__, static_url_path='/static')
    default_handler.setFormatter(logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(filename)s [%(funcName)s:%(lineno)d]: %(message)s'
    ))
    api = Api(flask_app)
    set_routing(flask_app, api)
    zk = create_kazoo_client()
    return flask_app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
