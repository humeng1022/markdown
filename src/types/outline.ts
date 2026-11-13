export interface OutlineItem {
  /** 与预览区标题 DOM 的 id 对应 */
  id: string;
  /** 标题纯文本 */
  text: string;
  /** 1–6，对应 h1–h6 */
  level: number;
}
