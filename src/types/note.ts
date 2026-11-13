/**
 * 一篇 Markdown 笔记。
 * 数据模型变更时需同步更新 TECH.md 的「数据模型」章节。
 */
export interface Note {
  /** crypto.randomUUID() 生成的唯一标识 */
  id: string;
  /** 由正文首行自动推导的标题 */
  title: string;
  /** Markdown 原文 */
  content: string;
  /** 创建时间戳（毫秒） */
  createdAt: number;
  /** 最后修改时间戳（毫秒） */
  updatedAt: number;
}
