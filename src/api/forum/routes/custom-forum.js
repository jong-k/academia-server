'use strict';

/**
 * 직접 만든 커스텀 라우터
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/forums/me',
      handler: 'forum.me',
      config: {},
    },
  ],
};
