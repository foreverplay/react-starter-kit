/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
import fetch from '../../core/fetch';
import Layout from '../../components/Layout';

export default {

    path: '/',

    action() {
        return {
            title: '嫣汐-虚拟偶像育成计划',
            component: <Layout showheader = "false"><Home/></Layout>,
        };
    },

};
