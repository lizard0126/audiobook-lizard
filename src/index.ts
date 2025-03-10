import { Context, Schema, Session, h } from 'koishi'
// npm publish --workspace koishi-plugin-audiobook-lizard --access public --registry https://registry.npmjs.org
export const name = 'audiobook-lizard'
export const inject = ['database'];

export const usage = `
# 🎧 有声书插件

## 用于搜索、订阅和管理喜马拉雅有声书
#### todo：
- [x] 记录播放进度
- [x] 管理订阅列表
- [x] 发送音频文件
- [ ] 可选语音播放
- [ ] 选择指定集数

---

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">使用方法</span></strong></summary>

### 搜索有声书
通过关键词搜索喜马拉雅有声书，并支持订阅。

#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
有声书 搜索 遮天 // 搜索关键词“遮天”</pre>

### 查看订阅列表
查看已订阅的有声书列表，并管理订阅内容。

#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
有声书.订阅列表 // 查看已订阅的有声书</pre>

### 取消订阅
从订阅列表中取消订阅某本有声书。

#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
有声书.取消订阅 // 取消订阅某本有声书</pre>
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">注意事项</span></strong></summary>

- 默认 API 为第三方服务，请勿随意更改。
- 搜索结果最多显示 100 条，可通过配置调整。
- 订阅功能依赖于数据库，请确保数据库正常运行。
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果要反馈建议或报告问题</span></strong></summary>

<strong>可以[点这里](https://github.com/lizard0126/audiobook-lizard/issues)创建议题~</strong>
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果喜欢我的插件</span></strong></summary>

<strong>可以[请我喝可乐](https://ifdian.net/a/lizard0126)，没准就有动力更新新功能了~</strong>
</details>
`
export interface Config {
  apiUrl: string;
  maxResults: number;
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string()
    .default('https://www.hhlqilongzhu.cn/api/ximalaya/ximalaya.php')
    .description('默认API请勿更改'),
  maxResults: Schema.number()
    .default(10)
    .min(1)
    .max(100)
    .description('搜索结果展示的最大条数，最多100条'),
})

export interface Audiobooks {
  id?: number;
  userId: string;
  albumId: string;
  title: string;
  totalTrack: string;
  trackId: string;
}

declare module 'koishi' {
  interface Tables {
    audiobooks: Audiobooks;
  }
}

export function apply(ctx: Context, config: Config) {
  const cache: Record<string, any> = {};

  ctx.model.extend('audiobooks', {
    id: 'unsigned',
    userId: 'string',
    albumId: 'string',
    title: 'string',
    totalTrack: 'string',
    trackId: 'string',
  }, {
    primary: 'id',
    autoInc: true,
  });

  async function getUserAlbums(session: Session): Promise<Audiobooks[]> {
    return await ctx.database.get('audiobooks', { userId: session.userId });
  }

  async function createRecord(session: Session, albumId: string, title: string, totalTrack: any) {
    await ctx.database.create('audiobooks', {
      userId: session.userId,
      albumId,
      title,
      totalTrack: JSON.stringify(totalTrack),
      trackId: '',
    });
  }

  async function deleteRecord(session: Session, albumId: string) {
    const existing = await ctx.database.get('audiobooks', {
      userId: session.userId,
      albumId: albumId
    });

    if (existing.length > 0) {
      await ctx.database.remove('audiobooks', {
        userId: session.userId,
        albumId: albumId,
      });
    } 
  }

  async function updateTrack(session: Session, albumId: string, trackId: string) {
    await ctx.database.set('audiobooks', {
      userId: session.userId,
      albumId,
    }, {
      trackId,
    });
  }

  async function fetchImage(url: string, referer: string): Promise<string> {
    const imageBuffer = await ctx.http.get(url, {
      headers: { referer },
      responseType: 'arraybuffer'
    });

    return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
  }

  async function getAudiobook(session: Session, trackId: string) {
    const url3 = `${config.apiUrl}?trackId=${trackId}`;

    try {
      const response = await ctx.http.get(url3);
      if (!response) throw new Error("未返回数据");

      const filename = `${response.title}`;

      await session.send(`${response.title}\n\n链接：${response.link}`);
      await session.send(h.file(response.url, { title: `${filename}.m4a` }));
    } catch (error) {
      await session.send(`获取音频数据失败：${error.message}`);
    }
  }

  async function getSelectedAlbum(session: Session) {
    const albums = await getUserAlbums(session);

    if (!albums.length) {
      await session.send('你还没有订阅任何有声书。');
      return null;
    }

    cache[session.userId] = albums;
    await session.send(
      albums.map((item, index) => `${index + 1}. ${item.title}`).join('\n') +
      '\n\n请输入编号选择查看详情，输入“0”退出。'
    );

    const input = await session.prompt(10000);
    if (!input || input.trim() === '0') {
      await session.send('已退出订阅列表选择。');
      return null;
    }

    const index = parseInt(input.trim(), 10) - 1;
    if (isNaN(index) || index < 0 || index >= albums.length) {
      await session.send('无效输入，请输入正确的编号。');
      return null;
    }

    return { selectedAlbum: albums[index] };
  }

  ctx.command('有声书', '获取喜马拉雅有声书，还可以订阅呦~')
    .subcommand(".搜索 <keyword>", "关键词搜索喜马拉雅有声书")
    .action(async ({ session }, keyword) => {
      if (!keyword) return '请提供关键词，例如：有声书 遮天';

      const url1 = `${config.apiUrl}?name=${encodeURIComponent(keyword)}`;

      try {
        const response = await ctx.http.get(url1);
        let data = response.data;

        if (!data?.length) {
          return '未找到相关有声书。';
        }

        data = data.slice(0, config.maxResults);
        cache[session.userId] = data;

        await session.send(
          data.map((item, index) => `${index + 1}. ${item.title}`).join('\n') +
          '\n\n请输入编号选择查看详情，输入“0”退出搜索。'
        );

        const input = await session.prompt(15000);
        if (!input || input.trim() === '0') {
          delete cache[session.userId];
          await session.send('已退出搜索。');
          return;
        }

        const index = parseInt(input.trim(), 10) - 1;
        if (isNaN(index) || index < 0 || index >= data.length) {
          delete cache[session.userId];
          await session.send('无效的编号，已退出搜索。');
          return;
        }

        const item = data[index];
        delete cache[session.userId];

        const img = await fetchImage(item.cover, ``);
        await session.send(`标题：${item.title}\n\n简介：${item.intro}` + h.image(img));

        const albums = await getUserAlbums(session);

        if (!albums.some(album => String(album.albumId) === String(item.albumId))) {
          await session.send(`是否将本书添加到订阅列表？\n回复“是”以确认。`);
          const add = await session.prompt(15000);

          if (add === '是') {
            const url2 = `${config.apiUrl}?albumId=${item.albumId}`;
            const totalTrack = await ctx.http.get(url2);
            await createRecord(session, item.albumId, item.title, totalTrack);
            await session.send(`已添加至订阅列表`);
          } else {
            await session.send(`放弃添加。`);
          }
        } else {
          await session.send(`你已订阅该有声书`);
        }

      } catch (error) {
        return `请求失败：${error.message}`;
      }
    });

  ctx.command('有声书.订阅列表', "查看已订阅的有声书")
    .action(async ({ session }) => {
      const result = await getSelectedAlbum(session);
      if (!result) return;

      const { selectedAlbum } = result;

      let trackList;
      try {
        trackList = JSON.parse(selectedAlbum.totalTrack);
      } catch (error) {
        return session.send('订阅数据格式错误，请尝试重新订阅。');
      }

      const currentTrackId = selectedAlbum.trackId;
      let currentTrack;

      if (!currentTrackId) {
        const nextTrack = trackList.data[0];

        await session.send(`当前有声书无获取记录，是否获取第一集？（是/否）`);
        const response = await session.prompt(10000);

        if (response === '是') {
          await getAudiobook(session, nextTrack.trackId);
          await updateTrack(session, selectedAlbum.albumId, String(nextTrack.trackId));
          return;
        } else {
          return '已取消。';
        }
      } else {
        currentTrack = trackList.data.find(track => String(track.trackId) === String(currentTrackId));
        const trackIndex = trackList.data.findIndex(track => String(track.trackId) === String(currentTrack.trackId));

        if (trackIndex === -1 || trackIndex >= trackList.data.length - 1) {
          return '已经是该有声书的最后一集。';
        }

        const nextTrack = trackList.data[trackIndex + 1];
        await session.send(`当前有声书进度：\n\n${currentTrack.title}\n\n是否获取下一集？（是/否）`);
        const response = await session.prompt(10000);

        if (response === '是') {
          await getAudiobook(session, nextTrack.trackId);
          await updateTrack(session, selectedAlbum.albumId, String(nextTrack.trackId));
          return;
        } else {
          return '已取消。';
        }
      }
    });

  ctx.command('有声书.取消订阅', "从订阅列表中选择取消订阅的有声书")
    .action(async ({ session }) => {
      const result = await getSelectedAlbum(session);
      if (!result) return;

      const { selectedAlbum } = result;
      await deleteRecord(session, selectedAlbum.albumId);
      await session.send(`已取消订阅：${selectedAlbum.title}`);
      return;
    });
}