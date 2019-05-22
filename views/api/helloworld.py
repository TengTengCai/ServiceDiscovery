#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2019-05-22 09:28
# @Author  : TengTengCai
# @File    : helloworld.py
from flask_restful import Resource


class HelloWorld(Resource):

    def get(self):
        return {'hello': 'world'}

