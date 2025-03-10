import { Context, Schema } from 'koishi';
export declare const name = "audiobook-lizard";
export declare const inject: string[];
export declare const usage = "\n# \uD83C\uDFA7 \u6709\u58F0\u4E66\u63D2\u4EF6\n\n## \u7528\u4E8E\u641C\u7D22\u3001\u8BA2\u9605\u548C\u7BA1\u7406\u559C\u9A6C\u62C9\u96C5\u6709\u58F0\u4E66\n#### todo\uFF1A\n- [x] \u8BB0\u5F55\u64AD\u653E\u8FDB\u5EA6\n- [x] \u7BA1\u7406\u8BA2\u9605\u5217\u8868\n- [x] \u53D1\u9001\u97F3\u9891\u6587\u4EF6\n- [ ] \u53EF\u9009\u8BED\u97F3\u64AD\u653E\n- [ ] \u9009\u62E9\u6307\u5B9A\u96C6\u6570\n\n---\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u4F7F\u7528\u65B9\u6CD5</span></strong></summary>\n\n### \u641C\u7D22\u6709\u58F0\u4E66\n\u901A\u8FC7\u5173\u952E\u8BCD\u641C\u7D22\u559C\u9A6C\u62C9\u96C5\u6709\u58F0\u4E66\uFF0C\u5E76\u652F\u6301\u8BA2\u9605\u3002\n\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">\n\u6709\u58F0\u4E66 \u641C\u7D22 \u906E\u5929 // \u641C\u7D22\u5173\u952E\u8BCD\u201C\u906E\u5929\u201D</pre>\n\n### \u67E5\u770B\u8BA2\u9605\u5217\u8868\n\u67E5\u770B\u5DF2\u8BA2\u9605\u7684\u6709\u58F0\u4E66\u5217\u8868\uFF0C\u5E76\u7BA1\u7406\u8BA2\u9605\u5185\u5BB9\u3002\n\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">\n\u6709\u58F0\u4E66.\u8BA2\u9605\u5217\u8868 // \u67E5\u770B\u5DF2\u8BA2\u9605\u7684\u6709\u58F0\u4E66</pre>\n\n### \u53D6\u6D88\u8BA2\u9605\n\u4ECE\u8BA2\u9605\u5217\u8868\u4E2D\u53D6\u6D88\u8BA2\u9605\u67D0\u672C\u6709\u58F0\u4E66\u3002\n\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">\n\u6709\u58F0\u4E66.\u53D6\u6D88\u8BA2\u9605 // \u53D6\u6D88\u8BA2\u9605\u67D0\u672C\u6709\u58F0\u4E66</pre>\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u6CE8\u610F\u4E8B\u9879</span></strong></summary>\n\n- \u9ED8\u8BA4 API \u4E3A\u7B2C\u4E09\u65B9\u670D\u52A1\uFF0C\u8BF7\u52FF\u968F\u610F\u66F4\u6539\u3002\n- \u641C\u7D22\u7ED3\u679C\u6700\u591A\u663E\u793A 100 \u6761\uFF0C\u53EF\u901A\u8FC7\u914D\u7F6E\u8C03\u6574\u3002\n- \u8BA2\u9605\u529F\u80FD\u4F9D\u8D56\u4E8E\u6570\u636E\u5E93\uFF0C\u8BF7\u786E\u4FDD\u6570\u636E\u5E93\u6B63\u5E38\u8FD0\u884C\u3002\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u8981\u53CD\u9988\u5EFA\u8BAE\u6216\u62A5\u544A\u95EE\u9898</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u70B9\u8FD9\u91CC](https://github.com/lizard0126/audiobook-lizard/issues)\u521B\u5EFA\u8BAE\u9898~</strong>\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u559C\u6B22\u6211\u7684\u63D2\u4EF6</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u8BF7\u6211\u559D\u53EF\u4E50](https://ifdian.net/a/lizard0126)\uFF0C\u6CA1\u51C6\u5C31\u6709\u52A8\u529B\u66F4\u65B0\u65B0\u529F\u80FD\u4E86~</strong>\n</details>\n";
export interface Config {
    apiUrl: string;
    maxResults: number;
}
export declare const Config: Schema<Config>;
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
export declare function apply(ctx: Context, config: Config): void;
