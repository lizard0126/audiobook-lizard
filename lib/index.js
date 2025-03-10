var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var name = "audiobook-lizard";
var inject = ["database"];
var usage = `
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
`;
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().default("https://www.hhlqilongzhu.cn/api/ximalaya/ximalaya.php").description("默认API请勿更改"),
  maxResults: import_koishi.Schema.number().default(10).min(1).max(100).description("搜索结果展示的最大条数，最多100条")
});
function apply(ctx, config) {
  const cache = {};
  ctx.model.extend("audiobooks", {
    id: "unsigned",
    userId: "string",
    albumId: "string",
    title: "string",
    totalTrack: "string",
    trackId: "string"
  }, {
    primary: "id",
    autoInc: true
  });
  async function getUserAlbums(session) {
    return await ctx.database.get("audiobooks", { userId: session.userId });
  }
  __name(getUserAlbums, "getUserAlbums");
  async function createRecord(session, albumId, title, totalTrack) {
    await ctx.database.create("audiobooks", {
      userId: session.userId,
      albumId,
      title,
      totalTrack: JSON.stringify(totalTrack),
      trackId: ""
    });
  }
  __name(createRecord, "createRecord");
  async function deleteRecord(session, albumId) {
    const existing = await ctx.database.get("audiobooks", {
      userId: session.userId,
      albumId
    });
    if (existing.length > 0) {
      await ctx.database.remove("audiobooks", {
        userId: session.userId,
        albumId
      });
    }
  }
  __name(deleteRecord, "deleteRecord");
  async function updateTrack(session, albumId, trackId) {
    await ctx.database.set("audiobooks", {
      userId: session.userId,
      albumId
    }, {
      trackId
    });
  }
  __name(updateTrack, "updateTrack");
  async function fetchImage(url, referer) {
    const imageBuffer = await ctx.http.get(url, {
      headers: { referer },
      responseType: "arraybuffer"
    });
    return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;
  }
  __name(fetchImage, "fetchImage");
  async function getAudiobook(session, trackId) {
    const url3 = `${config.apiUrl}?trackId=${trackId}`;
    try {
      const response = await ctx.http.get(url3);
      if (!response) throw new Error("未返回数据");
      const filename = `${response.title}`;
      await session.send(`${response.title}

链接：${response.link}`);
      await session.send(import_koishi.h.file(response.url, { title: `${filename}.m4a` }));
    } catch (error) {
      await session.send(`获取音频数据失败：${error.message}`);
    }
  }
  __name(getAudiobook, "getAudiobook");
  async function getSelectedAlbum(session) {
    const albums = await getUserAlbums(session);
    if (!albums.length) {
      await session.send("你还没有订阅任何有声书。");
      return null;
    }
    cache[session.userId] = albums;
    await session.send(
      albums.map((item, index2) => `${index2 + 1}. ${item.title}`).join("\n") + "\n\n请输入编号选择查看详情，输入“0”退出。"
    );
    const input = await session.prompt(1e4);
    if (!input || input.trim() === "0") {
      await session.send("已退出订阅列表选择。");
      return null;
    }
    const index = parseInt(input.trim(), 10) - 1;
    if (isNaN(index) || index < 0 || index >= albums.length) {
      await session.send("无效输入，请输入正确的编号。");
      return null;
    }
    return { selectedAlbum: albums[index] };
  }
  __name(getSelectedAlbum, "getSelectedAlbum");
  ctx.command("有声书", "获取喜马拉雅有声书，还可以订阅呦~").subcommand(".搜索 <keyword>", "关键词搜索喜马拉雅有声书").action(async ({ session }, keyword) => {
    if (!keyword) return "请提供关键词，例如：有声书 遮天";
    const url1 = `${config.apiUrl}?name=${encodeURIComponent(keyword)}`;
    try {
      const response = await ctx.http.get(url1);
      let data = response.data;
      if (!data?.length) {
        return "未找到相关有声书。";
      }
      data = data.slice(0, config.maxResults);
      cache[session.userId] = data;
      await session.send(
        data.map((item2, index2) => `${index2 + 1}. ${item2.title}`).join("\n") + "\n\n请输入编号选择查看详情，输入“0”退出搜索。"
      );
      const input = await session.prompt(15e3);
      if (!input || input.trim() === "0") {
        delete cache[session.userId];
        await session.send("已退出搜索。");
        return;
      }
      const index = parseInt(input.trim(), 10) - 1;
      if (isNaN(index) || index < 0 || index >= data.length) {
        delete cache[session.userId];
        await session.send("无效的编号，已退出搜索。");
        return;
      }
      const item = data[index];
      delete cache[session.userId];
      const img = await fetchImage(item.cover, ``);
      await session.send(`标题：${item.title}

简介：${item.intro}` + import_koishi.h.image(img));
      const albums = await getUserAlbums(session);
      if (!albums.some((album) => String(album.albumId) === String(item.albumId))) {
        await session.send(`是否将本书添加到订阅列表？
回复“是”以确认。`);
        const add = await session.prompt(15e3);
        if (add === "是") {
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
  ctx.command("有声书.订阅列表", "查看已订阅的有声书").action(async ({ session }) => {
    const result = await getSelectedAlbum(session);
    if (!result) return;
    const { selectedAlbum } = result;
    let trackList;
    try {
      trackList = JSON.parse(selectedAlbum.totalTrack);
    } catch (error) {
      return session.send("订阅数据格式错误，请尝试重新订阅。");
    }
    const currentTrackId = selectedAlbum.trackId;
    let currentTrack;
    if (!currentTrackId) {
      const nextTrack = trackList.data[0];
      await session.send(`当前有声书无获取记录，是否获取第一集？（是/否）`);
      const response = await session.prompt(1e4);
      if (response === "是") {
        await getAudiobook(session, nextTrack.trackId);
        await updateTrack(session, selectedAlbum.albumId, String(nextTrack.trackId));
        return;
      } else {
        return "已取消。";
      }
    } else {
      currentTrack = trackList.data.find((track) => String(track.trackId) === String(currentTrackId));
      const trackIndex = trackList.data.findIndex((track) => String(track.trackId) === String(currentTrack.trackId));
      if (trackIndex === -1 || trackIndex >= trackList.data.length - 1) {
        return "已经是该有声书的最后一集。";
      }
      const nextTrack = trackList.data[trackIndex + 1];
      await session.send(`当前有声书进度：

${currentTrack.title}

是否获取下一集？（是/否）`);
      const response = await session.prompt(1e4);
      if (response === "是") {
        await getAudiobook(session, nextTrack.trackId);
        await updateTrack(session, selectedAlbum.albumId, String(nextTrack.trackId));
        return;
      } else {
        return "已取消。";
      }
    }
  });
  ctx.command("有声书.取消订阅", "从订阅列表中选择取消订阅的有声书").action(async ({ session }) => {
    const result = await getSelectedAlbum(session);
    if (!result) return;
    const { selectedAlbum } = result;
    await deleteRecord(session, selectedAlbum.albumId);
    await session.send(`已取消订阅：${selectedAlbum.title}`);
    return;
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name,
  usage
});
