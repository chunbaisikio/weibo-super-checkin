const { get } = require('axios');

module.exports = class Client {
  constructor(cookie) {
    if (!cookie) throw new Error('未提供 cookie');
    this.cookie = cookie;
  }

  get(url, config = {}) {
    return get(url, {
      ...config,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
        Cookie: this.cookie,
        ...(config.headers || {}),
      },
    }).then(({ data }) => data);
  }

  async getFollowSuper() {
    const { ok, data } = await this.get(
      'https://m.weibo.cn/api/container/getIndex?containerid=100803_-_page_my_follow_super'
    );
    if (ok !== 1) throw new Error('超话列表获取失败');
    const list = data.cards[0].card_group;
    list.pop();
    list.shift();
    return list.map(({ scheme, title_sub }) => {
      const url = new URL(scheme);
      return {
        id: url.searchParams.get('containerid'),
        title: title_sub,
      };
    });
  }

  async superCheckin() {
    const list = await this.getFollowSuper();
    for (const { id, title } of list) {
      try {
        const data = await this.get('https://weibo.com/p/aj/general/button', {
          headers: {
            Referer: `https://weibo.com/p/${id}`,
          },
          params: {
            ajwvr: 6,
            api: 'http://i.huati.weibo.com/aj/super/checkin',
            texta: '签到',
            textb: '已签到',
            status: 0,
            id,
            location: 'page_100808_super_index',
            timezone: 'GMT+0800',
            lang: 'zh-cn',
            plat: 'MacIntel',
            ua:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
            screen: '1920*1080',
            __rnd: Date.now(),
          },
        });
        console.log(title, data.msg);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
